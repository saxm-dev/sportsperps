import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, ResponsiveContainer,
  CartesianGrid, Tooltip, ReferenceLine, Scatter
} from "recharts";
import {
  Play, Pause, RotateCcw, Zap, X, TrendingUp, TrendingDown,
  Trophy, Target, DollarSign, Activity, ChevronRight, ArrowRight, Shield
} from "lucide-react";

const BRAND = {
  accent: "#6366f1", accentAlt: "#818cf8", neon: "#22d3ee",
  green: "#34d399", red: "#f87171", gold: "#fbbf24",
  bg: "#060612", card: "#0c0c1d", border: "#1a1a3a", surface: "#12122a",
};
const fd = "'Outfit',sans-serif";
const fb = "'DM Sans','Outfit',sans-serif";
const fm = "'JetBrains Mono','SF Mono',monospace";

/* ═══════════════════════════════════════════════════════════
   GAME DATASETS
   ═══════════════════════════════════════════════════════════ */
const GAMES = [
  {
    id: "nfl-sb59",
    sport: "NFL",
    label: "Super Bowl LIX",
    subtitle: "Feb 9, 2025 · Caesars Superdome, New Orleans",
    tagline: "Eagles deny Chiefs three-peat in dominant blowout",
    emoji: "🏈",
    home: { name: "Eagles", short: "PHI", logo: "🦅", light: "#34d399" },
    away: { name: "Chiefs", short: "KC", logo: "🏹", light: "#f87171" },
    xTick: v => v>=57?"2MW":v>=45?"Q4":v>=30?"Q3":v>=15?"Q2":"Q1",
    periodLabel: q => q===0?"HALF":"Q"+q,
    playsLabel: "SCORING PLAYS",
    raw: [
      [0,.58,0,0,1,"15:00","Kickoff — Eagles receive",false],
      [2,.62,3,0,1,"11:45","⚡ PHI FG — Elliott 36yd",true],
      [4,.64,3,0,1,"8:30","KC 3-and-out, Mahomes sacked",false],
      [6,.72,10,0,1,"5:15","⚡ PHI TD — Hurts 1yd tush push!",true],
      [8,.74,10,0,1,"2:30","KC punt, Eagles D dominates",false],
      [10,.76,13,0,1,"0:30","⚡ PHI FG — Elliott 48yd",true],
      [12,.78,13,0,2,"13:00","KC 3-and-out again",false],
      [14,.82,13,0,2,"10:30","Mahomes INT! Baun picks it!",false],
      [16,.87,20,0,2,"8:00","⚡ PHI TD — Hurts 18yd to A.J. Brown!",true],
      [18,.85,20,0,2,"5:30","KC drives to midfield, punt",false],
      [20,.84,20,0,2,"3:45","PHI short drive",false],
      [22,.92,24,0,2,"2:00","⚡ PHI Pick-6! DeJean birthday INT return!",true],
      [24,.90,24,0,2,"0:30","KC incomplete, end of half",false],
      [26,.90,24,0,0,"HALF","HALFTIME — Eagles dominate 24-0",false],
      [28,.91,24,0,3,"13:00","PHI receives, drives",false],
      [30,.93,27,0,3,"10:00","⚡ PHI FG — Elliott 33yd",true],
      [32,.92,27,0,3,"7:30","KC finally moves the ball",false],
      [34,.95,34,0,3,"5:00","⚡ PHI TD — Hurts 46yd to DeVonta Smith!",true],
      [36,.92,34,0,3,"3:00","KC drives into PHI territory",false],
      [38,.88,34,8,3,"0:45","⚡ KC TD — Hopkins 7yd + 2pt conversion!",true],
      [40,.89,34,8,4,"14:00","Q4 — PHI up 26",false],
      [42,.91,37,8,4,"11:00","⚡ PHI FG — Elliott 29yd",true],
      [44,.90,37,8,4,"8:30","KC drives deep",false],
      [46,.86,37,16,4,"6:00","⚡ KC TD — Worthy 50yd bomb + 2pt!",true],
      [48,.89,37,16,4,"4:00","PHI running clock",false],
      [50,.93,40,16,4,"2:30","⚡ PHI FG — Elliott 26yd. SB kicker record!",true],
      [52,.91,40,16,4,"1:30","KC hurry-up",false],
      [54,.90,40,22,4,"0:40","⚡ KC TD — Worthy 2yd, 2pt fails",true],
      [56,.94,40,22,4,"0:30","Onside kick — PHI recovers!",false],
      [58,.97,40,22,4,"0:10","PHI victory formation",false],
      [60,1.0,40,22,4,"FINAL","🏆 EAGLES WIN SUPER BOWL 40-22!!",true],
    ],
  },
  {
    id: "mlb-ws7",
    sport: "MLB",
    label: "World Series Game 7",
    subtitle: "Nov 1, 2025 · Rogers Centre, Toronto",
    tagline: "Dodgers' 11th-inning comeback clinches back-to-back titles",
    emoji: "⚾",
    home: { name: "Dodgers", short: "LAD", logo: "🔵", light: "#60a5fa" },
    away: { name: "Blue Jays", short: "TOR", logo: "🐦", light: "#22d3ee" },
    xTick: v => {
      if (v >= 55) return "11th";
      if (v >= 50) return "10th";
      const inn = Math.floor(v / 5.5) + 1;
      return inn <= 9 ? inn + "" : "EX";
    },
    periodLabel: q => q === 0 ? "MID" : "INN " + q,
    playsLabel: "KEY PLAYS",
    raw: [
      [0,.48,0,0,1,"Top 1","First pitch — Ohtani on the mound for LAD",false],
      [3,.46,0,0,1,"Bot 1","TOR grounds out, scoreless 1st",false],
      [5,.45,0,0,2,"Top 2","LAD goes down in order",false],
      [8,.43,0,0,2,"Bot 2","TOR singles, runner stranded",false],
      [11,.42,0,0,3,"Top 3","LAD pop out, ground out",false],
      [13,.26,0,3,3,"Bot 3","⚡ TOR 3-run HR! Bichette crushes Ohtani!",true],
      [16,.28,0,3,4,"Top 4","LAD single, but double play ends inning",false],
      [19,.26,0,3,4,"Bot 4","TOR adds runners but stranded",false],
      [22,.32,1,3,5,"Top 5","⚡ LAD solo HR — Ohtani demolishes one!",true],
      [25,.30,1,3,5,"Bot 5","TOR 1-2-3 inning",false],
      [27,.33,1,3,6,"Top 6","LAD threatens, runners on corners",false],
      [28,.36,2,3,6,"Top 6","⚡ LAD sac fly — Hernandez scores!",true],
      [30,.30,2,4,6,"Bot 6","⚡ TOR RBI double — Giménez scores Clement!",true],
      [33,.28,2,4,7,"Top 7","LAD Ohtani walks, but double play",false],
      [36,.27,2,4,7,"Bot 7","Yesavage pitching for TOR, 1-2-3 inning",false],
      [38,.26,2,4,8,"Top 8","LAD rally begins...",false],
      [39,.40,3,4,8,"Top 8","⚡ LAD HR! Muncy smashes it to right!",true],
      [41,.38,3,4,8,"Bot 8","TOR goes down quietly",false],
      [43,.35,3,4,9,"Top 9","LAD down 1 in the 9th... last chance",false],
      [44,.32,3,4,9,"Top 9","One out... Rojas steps to the plate...",false],
      [45,.58,4,4,9,"Top 9","⚡⚡ ROJAS TIES IT! Solo HR! 4-4!!",true],
      [47,.54,4,4,9,"Bot 9","TOR threatens but Yamamoto enters to pitch",false],
      [48,.56,4,4,9,"Bot 9","Yamamoto escapes! Extra innings!",false],
      [50,.52,4,4,10,"Top 10","LAD can't push across a run",false],
      [52,.46,4,4,10,"Bot 10","TOR loads bases... Yamamoto escapes jam!",false],
      [54,.55,4,4,11,"Top 11","Smith at the plate vs Bieber...",false],
      [55,.84,5,4,11,"Top 11","⚡⚡ SMITH GO-AHEAD HR!! DODGERS LEAD!!",true],
      [57,.80,5,4,11,"Bot 11","Yamamoto back to close it out...",false],
      [58,.72,5,4,11,"Bot 11","Guerrero doubles! Tying run on 2nd!",false],
      [59,.88,5,4,11,"Bot 11","Kirk grounds into DOUBLE PLAY!! IT'S OVER!!",false],
      [60,1.0,5,4,11,"FINAL","🏆 DODGERS WIN WORLD SERIES 5-4!!",true],
    ],
  },
  {
    id: "nba-fin1",
    sport: "NBA",
    label: "NBA Finals Game 1",
    subtitle: "Jun 5, 2025 · Paycom Center, OKC",
    tagline: "Haliburton's 0.3-second buzzer-beater stuns the Thunder",
    emoji: "🏀",
    home: { name: "Pacers", short: "IND", logo: "🏎️", light: "#fbbf24" },
    away: { name: "Thunder", short: "OKC", logo: "⚡", light: "#60a5fa" },
    xTick: v => v>=45?"Q4":v>=30?"Q3":v>=15?"Q2":"Q1",
    periodLabel: q => q===0?"HALF":"Q"+q,
    playsLabel: "KEY PLAYS",
    raw: [
      [0,.30,0,0,1,"12:00","Tip-off at Paycom Center",false],
      [2,.26,4,10,1,"9:30","⚡ OKC 10-4 run, SGA with 6 early",true],
      [4,.22,10,18,1,"6:45","⚡ SGA three-pointer! OKC up 8",true],
      [6,.26,18,22,1,"4:00","⚡ IND Siakam drives for and-1!",true],
      [8,.24,22,28,1,"1:30","⚡ OKC Williams pull-up jumper",true],
      [10,.23,24,31,1,"0:00","End Q1 — OKC leads 31-24",false],
      [12,.20,28,38,2,"9:00","⚡ SGA step-back three! OKC up 10",true],
      [14,.16,32,45,2,"6:30","⚡ OKC Holmgren block + fast break!",true],
      [16,.20,40,49,2,"4:00","⚡ IND Mathurin three off the bench!",true],
      [18,.18,44,55,2,"1:30","⚡ OKC Caruso steal and layup",true],
      [20,.20,48,57,2,"0:00","End Q2 — OKC leads 57-48",false],
      [22,.20,48,57,0,"HALF","HALFTIME — Thunder up 9",false],
      [24,.15,52,64,3,"9:30","⚡ OKC 7-0 run to start Q3! Up 12",true],
      [26,.12,54,70,3,"7:00","⚡ SGA floater! OKC up 16!",true],
      [28,.18,62,74,3,"4:30","⚡ IND Haliburton to Siakam! 8-0 run!",true],
      [30,.22,68,78,3,"2:00","⚡ IND Mathurin three! Cutting the lead!",true],
      [32,.25,75,83,3,"0:00","End Q3 — OKC leads 83-75",false],
      [34,.30,80,87,4,"10:30","⚡ IND Turner dunk! Pacers within 7!",true],
      [36,.35,86,90,4,"8:00","⚡ IND Mathurin again! Within 4!",true],
      [38,.30,88,95,4,"6:30","⚡ OKC SGA drives, and-1. Pushes lead",true],
      [40,.42,95,98,4,"5:00","⚡ IND 7-0 run! Tied at 98!",true],
      [42,.45,98,98,4,"4:15","Haliburton to McConnell, Pacers rolling!",false],
      [44,.35,100,105,4,"3:00","⚡ OKC SGA takes over! 7 straight pts!",true],
      [46,.42,105,107,4,"2:00","⚡ IND Haliburton pull-up! Within 2!",true],
      [48,.38,107,110,4,"1:15","⚡ OKC Williams three! Thunder up 3!",true],
      [50,.45,110,110,4,"0:45","⚡ IND Siakam ties it! 110-110!",true],
      [52,.48,110,110,4,"0:30","SGA drives... blocked by Turner!",false],
      [54,.50,110,110,4,"0:15","OKC timeout. SGA isolation...",false],
      [56,.48,110,110,4,"0:05","SGA misses! Pacers rebound!",false],
      [58,.65,110,110,4,"0:03","IND timeout. Haliburton inbounds play...",false],
      [59,.95,111,110,4,"0:00","⚡⚡ HALIBURTON!! 0.3 SECONDS!! PACERS WIN!!",true],
      [60,1.0,111,110,4,"FINAL","🏆 PACERS UPSET! 111-110!!",true],
    ],
  },
];

/* Process game data */
function processGame(game) {
  const plays = game.raw.map(([t,p,hs,as,q,c,e,sc]) => ({t,p,hs,as,q,c,e,scoring:sc}));
  const scoringPlays = plays.filter(p => p.scoring && p.e.includes("⚡"));
  return { ...game, plays, scoringPlays };
}

const PROCESSED_GAMES = GAMES.map(processGame);

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
const noise = r => (Math.random()-.5)*2*r;
const fmt3 = n => n.toFixed(3);
const fmtUsd = n => (n<0?"-":"")+"$"+Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0});
const fmtPct = n => (n>=0?"+":"")+n.toFixed(1)+"%";
const pctClr = n => n>0?BRAND.green:n<0?BRAND.red:"#64748b";

function weightedMedian(items) {
  const s = [...items].sort((a,b)=>a.v-b.v);
  const tot = s.reduce((x,i)=>x+i.w,0);
  let c = 0;
  for (const i of s) { c += i.w; if (c >= tot/2) return i.v; }
  return s[s.length-1].v;
}

function catmullRom(p0,p1,p2,p3,t) {
  const t2=t*t, t3=t2*t;
  return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);
}

function getGameState(t, plays) {
  if (t >= plays[plays.length-1].t) return {...plays[plays.length-1]};
  for (let i=0; i<plays.length-1; i++) {
    if (t >= plays[i].t && t < plays[i+1].t) {
      const f = (t-plays[i].t)/(plays[i+1].t-plays[i].t);
      const i0 = Math.max(0,i-1), i3 = Math.min(plays.length-1,i+2);
      const sp = clamp(catmullRom(plays[i0].p,plays[i].p,plays[i+1].p,plays[i3].p,f),.01,.99);
      return {prob:sp, hs:plays[i].hs, as:plays[i].as, q:plays[i].q, c:plays[i].c, e:plays[i].e};
    }
  }
  return {...plays[0]};
}

function makeSources(p) {
  return [
    {name:"Polymarket",v:clamp(p+noise(.012),.01,.99),w:.30,color:"#818cf8"},
    {name:"Kalshi",v:clamp(p+noise(.008),.01,.99),w:.25,color:"#34d399"},
    {name:"Books",v:clamp(p+noise(.006),.01,.99),w:.25,color:"#fbbf24"},
    {name:"ESPN",v:clamp(p+noise(.018),.01,.99),w:.10,color:"#f87171"},
    {name:"Internal",v:clamp(p+noise(.010),.01,.99),w:.10,color:"#22d3ee"},
  ];
}

function makeBook(mid) {
  const sp=.004, asks=[], bids=[];
  for (let i=0; i<8; i++) {
    asks.push({price:+(mid+sp/2+i*.003).toFixed(3), size:Math.max(10,Math.round((160-i*14)*(.7+Math.random()*.6)))});
    bids.push({price:+(mid-sp/2-i*.003).toFixed(3), size:Math.max(10,Math.round((160-i*14)*(.7+Math.random()*.6)))});
  }
  return {asks:asks.reverse(), bids};
}

function maxLev(p) { const d=Math.min(p,1-p); if(d>=.2)return 10; if(d>=.1)return 5; if(d>=.05)return 3; return 2; }
function liqPrice(side,entry,lev) { return side==="home" ? entry*(1-1/lev) : entry*(1+1/lev); }
function calcPnL(side,exposure,entry,mark) { return side==="home" ? exposure*(mark-entry)/entry : exposure*(entry-mark)/entry; }

/* Chart Markers */
function HomeMarkerDot({cx,cy,payload}) {
  if (!payload || !payload.mh_marker || cx==null || cy==null) return null;
  const m = payload.mh_marker;
  if (m==="entry") return (<g><circle cx={cx} cy={cy} r={7} fill="#059669" stroke="#6ee7b7" strokeWidth={2}/><text x={cx} y={cy-14} textAnchor="middle" fill="#6ee7b7" fontSize={10} fontWeight="900">BUY</text></g>);
  if (m==="exit-win") return (<g><polygon points={`${cx},${cy-9} ${cx-7},${cy+4} ${cx+7},${cy+4}`} fill="#34d399" stroke="#ecfdf5" strokeWidth={1.5}/><text x={cx} y={cy-14} textAnchor="middle" fill="#34d399" fontSize={9} fontWeight="900">WIN</text></g>);
  if (m==="exit-loss") return (<g><polygon points={`${cx},${cy+9} ${cx-7},${cy-4} ${cx+7},${cy-4}`} fill="#f43f5e" stroke="#fff1f2" strokeWidth={1.5}/><text x={cx} y={cy+22} textAnchor="middle" fill="#f43f5e" fontSize={9} fontWeight="900">LOSS</text></g>);
  if (m==="liquidated") return (<g><rect x={cx-8} y={cy-8} width={16} height={16} rx={3} fill="#dc2626" stroke="#fca5a5" strokeWidth={2}/><text x={cx} y={cy+4} textAnchor="middle" fill="#fff" fontSize={9} fontWeight="900">X</text></g>);
  if (m==="settle") return (<g><circle cx={cx} cy={cy} r={10} fill="rgba(250,204,21,0.12)" stroke="#facc15" strokeWidth={2.5}/><text x={cx} y={cy+5} textAnchor="middle" fontSize={12} fill="#facc15" fontWeight="900">W</text></g>);
  return null;
}
function AwayMarkerDot({cx,cy,payload}) {
  if (!payload || !payload.ma_marker || cx==null || cy==null) return null;
  const m = payload.ma_marker;
  if (m==="entry") return (<g><circle cx={cx} cy={cy} r={7} fill="#be123c" stroke="#fda4af" strokeWidth={2}/><text x={cx} y={cy-14} textAnchor="middle" fill="#fda4af" fontSize={10} fontWeight="900">BUY</text></g>);
  if (m==="exit-win") return (<g><polygon points={`${cx},${cy-9} ${cx-7},${cy+4} ${cx+7},${cy+4}`} fill="#34d399" stroke="#ecfdf5" strokeWidth={1.5}/><text x={cx} y={cy-14} textAnchor="middle" fill="#34d399" fontSize={9} fontWeight="900">WIN</text></g>);
  if (m==="exit-loss") return (<g><polygon points={`${cx},${cy+9} ${cx-7},${cy-4} ${cx+7},${cy-4}`} fill="#f43f5e" stroke="#fff1f2" strokeWidth={1.5}/><text x={cx} y={cy+22} textAnchor="middle" fill="#f43f5e" fontSize={9} fontWeight="900">LOSS</text></g>);
  if (m==="liquidated") return (<g><rect x={cx-8} y={cy-8} width={16} height={16} rx={3} fill="#dc2626" stroke="#fca5a5" strokeWidth={2}/><text x={cx} y={cy+4} textAnchor="middle" fill="#fff" fontSize={9} fontWeight="900">X</text></g>);
  return null;
}
function ChartTip({active,payload}) {
  if (!active || !payload || !payload[0]) return null;
  const d = payload[0].payload;
  return (
    <div style={{background:"rgba(12,12,29,.95)",border:"1px solid "+BRAND.border,borderRadius:12,padding:"10px 16px"}}>
      <div style={{display:"flex",gap:20}}>
        <span style={{color:BRAND.green,fontWeight:900,fontSize:16,fontFamily:fm}}>{((d.ph||0)*100).toFixed(1)}%</span>
        <span style={{color:BRAND.red,fontWeight:900,fontSize:16,fontFamily:fm}}>{((d.pa||0)*100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
function LandingPage({ onLaunch }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 100); }, []);

  const features = [
    {icon:"📊", title:"Perpetual Futures", desc:"Trade win probability as a continuous price. Enter and exit positions at any moment during a live game."},
    {icon:"⚡", title:"Up to 10x Leverage", desc:"Amplify your conviction with dynamic leverage. Real-time liquidation engine built in."},
    {icon:"🌐", title:"Multi-Oracle Pricing", desc:"Aggregated from Polymarket, Kalshi, sportsbooks & ESPN. Weighted median ensures fair marks."},
    {icon:"🔗", title:"On-Chain Settlement", desc:"Every trade settles on Base. Smart contracts handle margin, liquidation and payout."},
    {icon:"⏱", title:"Real-Time Engine", desc:"Sub-second oracle updates. Dynamic funding rates. Automatic liquidation."},
    {icon:"🛡", title:"Risk Controls", desc:"Dynamic max leverage. Confidence bands. Insurance fund for socialized loss protection."},
  ];

  const stats = [
    {value:"$2.4T", label:"Global sports betting TAM"},
    {value:"10x", label:"Max leverage"},
    {value:"5", label:"Oracle sources"},
    {value:"<1s", label:"Price updates"},
  ];

  const steps = [
    {num:"01", title:"Pick Your Side", desc:"Choose which team you believe will win.", emoji:"🏈"},
    {num:"02", title:"Set Your Leverage", desc:"Higher leverage = higher reward and higher risk.", emoji:"⚡"},
    {num:"03", title:"Trade Live", desc:"Watch the game. Close anytime or ride to settlement.", emoji:"📈"},
  ];

  const anim = (delay) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(30px)",
    transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) " + delay + "s",
  });

  return (
    <div style={{background:BRAND.bg,minHeight:"100vh",fontFamily:fb,color:"#e2e8f0",overflow:"hidden"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:"-20%",left:"10%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,.08) 0%,transparent 70%)",filter:"blur(80px)"}}/>
        <div style={{position:"absolute",bottom:"-10%",right:"5%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(34,211,238,.06) 0%,transparent 70%)",filter:"blur(80px)"}}/>
      </div>
      <div style={{position:"relative",zIndex:1}}>
        <nav style={{...anim(0),padding:"20px 40px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,"+BRAND.accent+","+BRAND.neon+")",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:fd,fontWeight:900,fontSize:18,color:"#fff"}}>⟐</div>
            <span style={{fontFamily:fd,fontWeight:900,fontSize:22,letterSpacing:"-0.03em"}}>perps<span style={{color:BRAND.accent}}>.io</span></span>
          </div>
          <div style={{display:"flex",gap:32,alignItems:"center"}}>
            {["Protocol","Docs","Community"].map(t => (
              <span key={t} style={{fontSize:14,color:"#94a3b8",fontWeight:600,cursor:"pointer"}}>{t}</span>
            ))}
            <button onClick={onLaunch} style={{padding:"10px 24px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:fd,fontWeight:800,fontSize:14,background:"linear-gradient(135deg,"+BRAND.accent+","+BRAND.accentAlt+")",color:"#fff",boxShadow:"0 4px 20px "+BRAND.accent+"40"}}>
              Launch App
            </button>
          </div>
        </nav>
        <section style={{padding:"80px 40px 60px",maxWidth:1200,margin:"0 auto",textAlign:"center"}}>
          <div style={{...anim(0.1),marginBottom:20}}>
            <span style={{display:"inline-block",padding:"6px 16px",borderRadius:20,fontSize:13,fontWeight:700,background:BRAND.accent+"15",color:BRAND.accentAlt,border:"1px solid "+BRAND.accent+"30",letterSpacing:"0.06em"}}>
              BUILT ON BASE · POWERED BY MULTI-ORACLE CONSENSUS
            </span>
          </div>
          <h1 style={{...anim(0.2),fontFamily:fd,fontSize:72,fontWeight:900,lineHeight:1.05,letterSpacing:"-0.04em",margin:"0 0 24px",maxWidth:900,marginLeft:"auto",marginRight:"auto"}}>
            Trade Sports with<br/>
            <span style={{background:"linear-gradient(135deg,"+BRAND.neon+","+BRAND.accent+","+BRAND.red+")",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Perpetual Futures</span>
          </h1>
          <p style={{...anim(0.3),fontSize:20,lineHeight:1.6,color:"#94a3b8",maxWidth:640,margin:"0 auto 40px",fontWeight:500}}>
            The first leveraged prediction market for live sports. Pick a team, set your leverage, and trade win probability in real-time — on-chain.
          </p>
          <div style={{...anim(0.4),display:"flex",gap:16,justifyContent:"center"}}>
            <button onClick={onLaunch} style={{padding:"16px 36px",borderRadius:14,border:"none",cursor:"pointer",fontFamily:fd,fontWeight:800,fontSize:16,background:"linear-gradient(135deg,"+BRAND.accent+",#4f46e5)",color:"#fff",boxShadow:"0 8px 32px "+BRAND.accent+"50",display:"flex",alignItems:"center",gap:10}}>
              Try Live Demo <ArrowRight size={18}/>
            </button>
            <button style={{padding:"16px 36px",borderRadius:14,border:"1px solid "+BRAND.border,cursor:"pointer",fontFamily:fd,fontWeight:700,fontSize:16,background:"transparent",color:"#94a3b8"}}>
              Read Whitepaper
            </button>
          </div>
        </section>
        <section style={{...anim(0.5),maxWidth:900,margin:"0 auto 60px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,borderRadius:20,overflow:"hidden",background:BRAND.border}}>
          {stats.map(st => (
            <div key={st.label} style={{background:BRAND.card,padding:"28px 20px",textAlign:"center"}}>
              <div style={{fontSize:32,fontWeight:900,fontFamily:fm,color:BRAND.neon,letterSpacing:"-0.03em"}}>{st.value}</div>
              <div style={{fontSize:13,color:"#64748b",fontWeight:600,marginTop:4}}>{st.label}</div>
            </div>
          ))}
        </section>
        <section style={{maxWidth:1100,margin:"0 auto 80px",padding:"0 40px"}}>
          <div style={{...anim(0.55),textAlign:"center",marginBottom:48}}>
            <h2 style={{fontFamily:fd,fontSize:40,fontWeight:900,letterSpacing:"-0.03em",marginBottom:12}}>How It Works</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24}}>
            {steps.map((step,i) => (
              <div key={step.num} style={{...anim(0.6+i*0.1),background:BRAND.card,borderRadius:20,padding:"36px 28px",border:"1px solid "+BRAND.border,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:16,right:20,fontSize:64,fontFamily:fm,fontWeight:900,color:"#ffffff04",lineHeight:1}}>{step.num}</div>
                <div style={{fontSize:40,marginBottom:16}}>{step.emoji}</div>
                <div style={{fontSize:12,fontFamily:fm,fontWeight:800,color:BRAND.accent,marginBottom:8,letterSpacing:"0.1em"}}>STEP {step.num}</div>
                <h3 style={{fontFamily:fd,fontSize:24,fontWeight:800,marginBottom:10}}>{step.title}</h3>
                <p style={{fontSize:15,lineHeight:1.6,color:"#94a3b8",fontWeight:500}}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section style={{maxWidth:1100,margin:"0 auto 80px",padding:"0 40px"}}>
          <div style={{...anim(0.7),textAlign:"center",marginBottom:48}}>
            <h2 style={{fontFamily:fd,fontSize:40,fontWeight:900,letterSpacing:"-0.03em",marginBottom:12}}>Built for Serious Traders</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
            {features.map((f,i) => (
              <div key={f.title} style={{...anim(0.75+i*0.05),padding:"28px 24px",borderRadius:16,background:"#ffffff03",border:"1px solid "+BRAND.border}}>
                <div style={{fontSize:28,marginBottom:14}}>{f.icon}</div>
                <h4 style={{fontFamily:fd,fontSize:18,fontWeight:800,marginBottom:8}}>{f.title}</h4>
                <p style={{fontSize:14,lineHeight:1.6,color:"#64748b",fontWeight:500}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section style={{...anim(0.9),maxWidth:800,margin:"0 auto 80px",textAlign:"center",padding:"60px 40px",background:"linear-gradient(135deg,"+BRAND.accent+"10,"+BRAND.neon+"08)",borderRadius:28,border:"1px solid "+BRAND.accent+"20"}}>
          <h2 style={{fontFamily:fd,fontSize:36,fontWeight:900,letterSpacing:"-0.03em",marginBottom:16}}>See It In Action</h2>
          <p style={{fontSize:17,color:"#94a3b8",marginBottom:32,fontWeight:500,maxWidth:500,margin:"0 auto 32px"}}>
            Replay real championship games. Place leveraged trades in real-time. See how the perps engine works.
          </p>
          <button onClick={onLaunch} style={{padding:"18px 44px",borderRadius:16,border:"none",cursor:"pointer",fontFamily:fd,fontWeight:900,fontSize:18,background:"linear-gradient(135deg,"+BRAND.accent+",#4f46e5)",color:"#fff",boxShadow:"0 8px 40px "+BRAND.accent+"50",display:"inline-flex",alignItems:"center",gap:12}}>
            <Play size={20}/> Launch Live Demo
          </button>
        </section>
        <footer style={{padding:"24px 40px",borderTop:"1px solid "+BRAND.border,display:"flex",justifyContent:"space-between",alignItems:"center",opacity:.7}}>
          <span style={{fontFamily:fd,fontWeight:700,fontSize:14,color:"#475569"}}>© 2025 perps.io · Built on Base</span>
          <span style={{fontSize:13,color:"#334155"}}>Simulation for demonstration purposes</span>
        </footer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GAME SELECTOR
   ═══════════════════════════════════════════════════════════ */
function GameSelector({ onSelect, onBack }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 50); }, []);
  const anim = (delay) => ({
    opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)",
    transition: "all 0.6s cubic-bezier(0.16,1,0.3,1) " + delay + "s",
  });

  return (
    <div style={{background:BRAND.bg,minHeight:"100vh",fontFamily:fb,color:"#e2e8f0"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:"10%",left:"20%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,.06) 0%,transparent 70%)",filter:"blur(80px)"}}/>
        <div style={{position:"absolute",bottom:"10%",right:"15%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(34,211,238,.05) 0%,transparent 70%)",filter:"blur(80px)"}}/>
      </div>
      <div style={{position:"relative",zIndex:1}}>
        <nav style={{...anim(0),padding:"20px 40px",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#64748b",display:"flex",alignItems:"center",gap:4,fontSize:13,fontWeight:700,fontFamily:fb,padding:0}}>
            <ChevronRight size={14} style={{transform:"rotate(180deg)"}}/> Home
          </button>
          <div style={{width:1,height:20,background:BRAND.border}}/>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,"+BRAND.accent+","+BRAND.neon+")",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:fd,fontWeight:900,fontSize:14,color:"#fff"}}>⟐</div>
            <span style={{fontFamily:fd,fontWeight:900,fontSize:18}}>perps<span style={{color:BRAND.accent}}>.io</span></span>
          </div>
          <span style={{fontSize:10,padding:"3px 10px",borderRadius:20,fontWeight:800,background:BRAND.accent+"15",color:BRAND.accentAlt,letterSpacing:"0.1em",fontFamily:fm}}>DEMO</span>
        </nav>

        <div style={{maxWidth:900,margin:"0 auto",padding:"60px 40px",textAlign:"center"}}>
          <div style={anim(0.05)}>
            <h1 style={{fontFamily:fd,fontSize:48,fontWeight:900,letterSpacing:"-0.04em",marginBottom:12}}>Choose a Game</h1>
            <p style={{color:"#64748b",fontSize:17,fontWeight:500,marginBottom:48}}>Select a real championship game to replay with the perps.io trading engine.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
            {PROCESSED_GAMES.map((game, i) => (
              <button key={game.id} onClick={() => onSelect(game)} style={{
                ...anim(0.1 + i * 0.08),
                background: BRAND.card, border: "1px solid " + BRAND.border, borderRadius: 24,
                padding: "32px 24px", cursor: "pointer", textAlign: "left",
                transition: "all .25s", display: "flex", flexDirection: "column", gap: 16,
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:48}}>{game.emoji}</span>
                  <span style={{fontSize:12,fontWeight:800,padding:"4px 12px",borderRadius:20,background:BRAND.accent+"15",color:BRAND.accentAlt,fontFamily:fm,letterSpacing:"0.08em"}}>{game.sport}</span>
                </div>
                <div>
                  <h3 style={{fontFamily:fd,fontSize:22,fontWeight:900,letterSpacing:"-0.02em",color:"#e2e8f0",marginBottom:6}}>{game.label}</h3>
                  <p style={{fontSize:13,color:"#64748b",fontWeight:600,marginBottom:12}}>{game.subtitle}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"#ffffff04",borderRadius:14,border:"1px solid #ffffff06"}}>
                  <span style={{fontSize:24}}>{game.home.logo}</span>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:fd,fontWeight:800,fontSize:14}}>{game.home.name}</div>
                    <div style={{fontSize:11,color:"#475569",fontWeight:600}}>vs {game.away.name} {game.away.logo}</div>
                  </div>
                  <ChevronRight size={18} style={{color:"#475569"}}/>
                </div>
                <p style={{fontSize:13,color:"#94a3b8",fontWeight:500,lineHeight:1.5,fontStyle:"italic"}}>{game.tagline}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TRADING APP
   ═══════════════════════════════════════════════════════════ */
function TradingApp({ game, onBack, onChangeGame }) {
  const G = game;
  const HOME = G.home;
  const AWAY = G.away;
  const PLAYS = G.plays;
  const SCORING_PLAYS = G.scoringPlays;
  const initProb = PLAYS[0].p;

  const [gameTime, setGameTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [chartData, setChartData] = useState([{t:0,ph:initProb,pa:1-initProb,floor:clamp(initProb-.2,.01,.99),ceil:clamp(initProb+.2,.01,.99)}]);
  const [oracle, setOracle] = useState({price:initProb,sources:makeSources(initProb),floor:clamp(initProb-.2,.01,.99),ceil:clamp(initProb+.2,.01,.99)});
  const [book, setBook] = useState(makeBook(initProb));
  const [gameState, setGameState2] = useState(PLAYS[0]);
  const [settled, setSettled] = useState(false);
  const [positions, setPositions] = useState([]);
  const [closedPos, setClosedPos] = useState([]);
  const [balance, setBalance] = useState(10000);
  const [closedPnL, setClosedPnL] = useState(0);
  const [orderSide, setOrderSide] = useState("home");
  const [orderMargin, setOrderMargin] = useState(500);
  const [orderLev, setOrderLev] = useState(5);
  const [notifs, setNotifs] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [visibleScoring, setVisibleScoring] = useState([]);

  const lastCT = useRef(0); const lastEv = useRef("");
  const posR = useRef([]); posR.current = positions;
  const oR = useRef(oracle); oR.current = oracle;
  const gtR = useRef(0); gtR.current = gameTime;

  const notify = useCallback((msg,type) => {
    const id = Date.now()+Math.random();
    setNotifs(p => [...p.slice(-3), {id,msg,type:type||"info"}]);
    setTimeout(() => setNotifs(p => p.filter(n => n.id!==id)), 5000);
  }, []);
  const addMark = useCallback((t,p,markerType,line) => {
    setMarkers(prev => [...prev, {t:+t.toFixed(2),p,markerType,line:line||"home"}]);
  }, []);

  const liqLines = useMemo(() => positions.map(pos => ({
    id:pos.id, side:pos.side, liq:pos.liq,
    liqOnChart: pos.side==="home" ? pos.liq : 1-pos.liq,
  })), [positions]);

  const merged = useMemo(() => {
    const data = chartData.map(d => ({...d,mh_val:null,mh_marker:null,ma_val:null,ma_marker:null}));
    for (const m of markers) {
      let best = 0;
      for (let i=1; i<data.length; i++) { if (Math.abs(data[i].t-m.t) < Math.abs(data[best].t-m.t)) best = i; }
      if (Math.abs(data[best].t-m.t) < 0.5) {
        if (m.line==="away") { data[best].ma_val = 1-m.p; data[best].ma_marker = m.markerType; }
        else { data[best].mh_val = m.p; data[best].mh_marker = m.markerType; }
      } else {
        const idx = data.findIndex(d => d.t > m.t);
        const refI = Math.max(0, (idx===-1 ? data.length : idx) - 1);
        const ref = data[refI];
        const pt = {t:m.t, ph:m.p, pa:1-m.p, floor:ref.floor, ceil:ref.ceil, mh_val:null, mh_marker:null, ma_val:null, ma_marker:null};
        if (m.line==="away") { pt.ma_val = 1-m.p; pt.ma_marker = m.markerType; }
        else { pt.mh_val = m.p; pt.mh_marker = m.markerType; }
        if (idx===-1) data.push(pt); else data.splice(idx,0,pt);
      }
    }
    return data;
  }, [chartData, markers]);

  useEffect(() => {
    if (!playing || settled) return;
    const iv = setInterval(() => {
      setGameTime(prev => {
        const dt = (0.1*speed)/60; const next = Math.min(prev+dt, 60);
        const gs = getGameState(next, PLAYS);
        const sources = makeSources(gs.prob);
        const op = clamp(weightedMedian(sources),.01,.99);
        const fl = clamp(op-.2,.01,.99), cl = clamp(op+.2,.01,.99);
        setOracle({price:op, sources, floor:fl, ceil:cl});
        setBook(makeBook(op)); setGameState2(gs);
        if (next - lastCT.current > 0.12) {
          setChartData(cd => [...cd, {t:+next.toFixed(2), ph:+op.toFixed(4), pa:+(1-op).toFixed(4), floor:+fl.toFixed(4), ceil:+cl.toFixed(4)}]);
          lastCT.current = next;
        }
        SCORING_PLAYS.forEach(sp => { if (next >= sp.t && prev < sp.t) setVisibleScoring(vs => vs.find(v => v.t===sp.t) ? vs : [sp,...vs]); });
        if (gs.e !== lastEv.current && gs.e.includes("⚡")) { notify(gs.e.replace(/⚡/g,"").trim(), gs.e.includes(HOME.short) ? "green" : "red"); lastEv.current = gs.e; }
        const cp = posR.current;
        if (cp.length > 0) {
          let changed = false;
          const upd = cp.filter(pos => {
            const pnl = calcPnL(pos.side, pos.exposure, pos.entry, op);
            if (pnl <= -pos.margin * 0.95) {
              changed = true; addMark(next, op, "liquidated", pos.side);
              setClosedPos(pr => [{...pos, closedAt:op, pnl:-pos.margin, closeType:"LIQ", closeTime:next}, ...pr]);
              notify("☠ LIQUIDATED — " + (pos.side==="home"?HOME:AWAY).name, "red");
              setClosedPnL(p => p - pos.margin); return false;
            } return true;
          });
          if (changed) setPositions(upd);
        }
        if (next >= 60) {
          setSettled(true); setPlaying(false); addMark(60, 1.0, "settle", "home");
          const fp = posR.current; let sp2 = 0; const nc = [];
          fp.forEach(pos => { const pnl = calcPnL(pos.side, pos.exposure, pos.entry, 1.0); sp2 += pnl; nc.push({...pos, closedAt:1.0, pnl, closeType:"SETTLED", closeTime:60}); });
          if (fp.length > 0) { setClosedPos(pr => [...nc,...pr]); setBalance(b => b + fp.reduce((s,p) => s+p.margin, 0) + sp2); setClosedPnL(p => p + sp2); setPositions([]); notify("🏆 SETTLED — " + HOME.name + " win! PnL: " + fmtUsd(sp2), "green"); }
          else notify("🏆 " + HOME.name + " win!", "green");
        }
        return next;
      });
    }, 100);
    return () => clearInterval(iv);
  }, [playing, speed, settled, notify, addMark, PLAYS, SCORING_PLAYS, HOME, AWAY]);

  const placeOrder = useCallback(() => {
    if (settled) return;
    const o = oR.current, gt = gtR.current, ml2 = maxLev(o.price);
    const lev = Math.min(orderLev, ml2), margin = Math.min(orderMargin, balance);
    if (margin < 10) { notify("Insufficient margin","red"); return; }
    const exposure = margin*lev, entry = o.price, liq = liqPrice(orderSide, entry, lev);
    setPositions(p => [...p, {id:Date.now(), side:orderSide, margin, leverage:lev, exposure, entry, liq, openTime:gt}]);
    setBalance(b => b - margin); addMark(gt, entry, "entry", orderSide);
    const tn = orderSide==="home" ? HOME : AWAY;
    notify(tn.logo+" "+tn.name+" "+lev+"x at "+fmt3(entry), orderSide==="home" ? "green" : "red");
  }, [oracle.price, orderSide, orderMargin, orderLev, balance, settled, gameTime, notify, addMark, HOME, AWAY]);

  const closePosition = useCallback((id) => {
    setPositions(prev => {
      const pos = prev.find(p => p.id===id); if (!pos) return prev;
      const o = oR.current, gt = gtR.current;
      const pnl = calcPnL(pos.side, pos.exposure, pos.entry, o.price);
      setBalance(b => b + pos.margin + pnl); setClosedPnL(p => p + pnl);
      addMark(gt, o.price, pnl>=0 ? "exit-win" : "exit-loss", pos.side);
      setClosedPos(pr => [{...pos, closedAt:o.price, pnl, closeType:"CLOSED", closeTime:gt}, ...pr]);
      notify("Closed " + (pos.side==="home"?HOME:AWAY).name + " — " + fmtUsd(pnl), pnl>=0?"green":"red");
      return prev.filter(p => p.id !== id);
    });
  }, [notify, addMark, HOME, AWAY]);

  const resetAll = useCallback(() => {
    setGameTime(0); setPlaying(false); setSettled(false);
    setChartData([{t:0,ph:initProb,pa:1-initProb,floor:clamp(initProb-.2,.01,.99),ceil:clamp(initProb+.2,.01,.99)}]);
    setOracle({price:initProb,sources:makeSources(initProb),floor:clamp(initProb-.2,.01,.99),ceil:clamp(initProb+.2,.01,.99)});
    setBook(makeBook(initProb)); setGameState2(PLAYS[0]);
    setPositions([]); setClosedPos([]); setBalance(10000); setClosedPnL(0);
    setMarkers([]); setVisibleScoring([]); lastCT.current = 0; lastEv.current = ""; setNotifs([]);
  }, [initProb, PLAYS]);

  const totalUPnL = positions.reduce((s,p) => s + calcPnL(p.side,p.exposure,p.entry,oracle.price), 0);
  const totalEq = balance + positions.reduce((s,p) => s+p.margin, 0) + totalUPnL;
  const ml = maxLev(oracle.price), eL = Math.min(orderLev, ml), eM = Math.min(orderMargin, balance);
  const team = orderSide==="home" ? HOME : AWAY;
  const expo = eM * eL, liqP = liqPrice(orderSide, oracle.price, eL);
  const awayProb = 1 - oracle.price;
  const prevProb = merged.length > 40 ? merged[merged.length-40].ph : merged[0].ph;
  const momentum = oracle.price - prevProb;

  return (
    <div style={{background:BRAND.bg,fontFamily:fb,minHeight:"100vh",color:"#e2e8f0"}}>
      {/* Notifs */}
      <div style={{position:"fixed",top:16,right:16,zIndex:50,display:"flex",flexDirection:"column",gap:8,maxWidth:400}}>
        {notifs.map(n => (
          <div key={n.id} style={{padding:"12px 20px",borderRadius:14,fontSize:14,fontWeight:600,
            background:n.type==="green"?"#022c22ee":n.type==="red"?"#2a0410ee":BRAND.card+"ee",
            border:"1px solid "+(n.type==="green"?"#065f46":n.type==="red"?"#881337":BRAND.border),
            color:n.type==="green"?"#6ee7b7":n.type==="red"?"#fda4af":"#cbd5e1",
            backdropFilter:"blur(16px)",animation:"slideIn .3s ease-out"}}>{n.msg}</div>
        ))}
      </div>

      {/* Top bar */}
      <div style={{borderBottom:"1px solid "+BRAND.border+"60",padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,background:"linear-gradient(180deg,"+BRAND.surface+","+BRAND.bg+")"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onChangeGame} style={{background:"none",border:"none",cursor:"pointer",color:"#64748b",display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:700,fontFamily:fb,padding:0}}>
            <ChevronRight size={14} style={{transform:"rotate(180deg)"}}/> Games
          </button>
          <div style={{width:1,height:20,background:BRAND.border}}/>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,"+BRAND.accent+","+BRAND.neon+")",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:fd,fontWeight:900,fontSize:14,color:"#fff"}}>⟐</div>
            <span style={{fontFamily:fd,fontWeight:900,fontSize:18}}>perps<span style={{color:BRAND.accent}}>.io</span></span>
          </div>
          <span style={{fontSize:10,padding:"3px 10px",borderRadius:20,fontWeight:800,background:BRAND.accent+"15",color:BRAND.accentAlt,letterSpacing:"0.1em",fontFamily:fm}}>DEMO</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:24,fontSize:13}}>
          {[["Equity",totalEq,"#e2e8f0",true],["Available",balance,"#94a3b8",false],["Open P&L",totalUPnL,pctClr(totalUPnL),false],["Realized",closedPnL,pctClr(closedPnL),false]].map(([l,v,c,big]) =>
            <div key={l} style={{display:"flex",alignItems:"baseline",gap:6}}>
              <span style={{color:"#475569",fontSize:11,fontWeight:600}}>{l}</span>
              <span style={{fontWeight:big?900:700,fontSize:big?18:13,color:c,fontFamily:fm,fontVariantNumeric:"tabular-nums"}}>{fmtUsd(v)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Game header */}
      <div style={{padding:"14px 20px",background:"linear-gradient(180deg,"+BRAND.surface+","+BRAND.bg+")",borderBottom:"1px solid "+BRAND.border+"40",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:24}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:36}}>{HOME.logo}</span>
            <div>
              <div style={{fontWeight:800,fontSize:12,color:"#94a3b8",letterSpacing:"0.08em",fontFamily:fd}}>{HOME.name.toUpperCase()}</div>
              <div style={{fontSize:42,fontWeight:900,lineHeight:1,color:gameState.hs>=gameState.as?HOME.light:"#334155",fontFamily:fm,fontVariantNumeric:"tabular-nums"}}>{gameState.hs}</div>
            </div>
          </div>
          <div style={{textAlign:"center",padding:"0 16px"}}>
            <div style={{fontSize:12,fontWeight:900,padding:"5px 16px",borderRadius:24,letterSpacing:"0.08em",fontFamily:fd,
              background:settled?"linear-gradient(135deg,#022c22,#064e3b)":gameState.q===0?"linear-gradient(135deg,#422006,#78350f)":"linear-gradient(135deg,#450a0a80,#7f1d1d80)",
              border:"1px solid "+(settled?"#065f46":gameState.q===0?"#92400e":"#881337"),
              color:settled?"#6ee7b7":gameState.q===0?"#fbbf24":"#fda4af"}}>
              {settled?"FINAL":gameState.q===0?"HALFTIME":G.periodLabel(gameState.q)+" · "+gameState.c}
            </div>
            <div style={{color:"#334155",fontSize:11,marginTop:6,fontWeight:600}}>{G.sport} · {G.label}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontWeight:800,fontSize:12,color:"#94a3b8",letterSpacing:"0.08em",fontFamily:fd}}>{AWAY.name.toUpperCase()}</div>
              <div style={{fontSize:42,fontWeight:900,lineHeight:1,color:gameState.as>gameState.hs?AWAY.light:"#334155",fontFamily:fm,fontVariantNumeric:"tabular-nums"}}>{gameState.as}</div>
            </div>
            <span style={{fontSize:36}}>{AWAY.logo}</span>
          </div>
        </div>
        <div style={{flex:"1 1 0",minWidth:0,maxWidth:260,padding:"8px 14px",background:"#ffffff03",borderRadius:10,border:"1px solid #ffffff06"}}>
          <div style={{fontSize:12,color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:8}}>
            <Activity size={12} style={{flexShrink:0,color:"#64748b"}}/><span style={{fontWeight:600}}>{gameState.e}</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:20}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:12,color:"#64748b",fontWeight:700,marginBottom:2}}>{HOME.logo} {HOME.short}</div>
            <div style={{fontSize:30,fontWeight:900,color:HOME.light,lineHeight:1,fontFamily:fm,fontVariantNumeric:"tabular-nums"}}>{(oracle.price*100).toFixed(1)}<span style={{fontSize:16,opacity:.7}}>%</span></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            {momentum > 0.01 ? <TrendingUp size={20} style={{color:BRAND.green}}/> : momentum < -0.01 ? <TrendingDown size={20} style={{color:BRAND.red}}/> : <span style={{color:"#334155",fontSize:16}}>—</span>}
            <span style={{fontSize:9,color:"#475569",fontWeight:700,fontFamily:fm}}>MOMENTUM</span>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:12,color:"#64748b",fontWeight:700,marginBottom:2}}>{AWAY.logo} {AWAY.short}</div>
            <div style={{fontSize:30,fontWeight:900,color:AWAY.light,lineHeight:1,fontFamily:fm,fontVariantNumeric:"tabular-nums"}}>{(awayProb*100).toFixed(1)}<span style={{fontSize:16,opacity:.7}}>%</span></div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{display:"flex",flexWrap:"wrap"}}>
        {/* LEFT */}
        <div style={{flex:"1 1 0",minWidth:0}}>
          <div style={{padding:"16px 20px 0 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:12}}>
              <span style={{color:"#475569",fontWeight:800,letterSpacing:"0.06em",fontFamily:fd}}>WIN PROBABILITY</span>
              <div style={{display:"flex",gap:20,alignItems:"center"}}>
                <span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:16,height:3,background:HOME.light,display:"inline-block",borderRadius:2}}/><span style={{color:"#94a3b8",fontWeight:600}}>{HOME.logo} {HOME.short}</span></span>
                <span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:16,height:3,background:AWAY.light,display:"inline-block",borderRadius:2}}/><span style={{color:"#94a3b8",fontWeight:600}}>{AWAY.logo} {AWAY.short}</span></span>
              </div>
            </div>
            <div style={{height:340}}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={merged} margin={{top:16,right:12,bottom:5,left:10}}>
                  <defs>
                    <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={HOME.light} stopOpacity={0.22}/><stop offset="100%" stopColor={HOME.light} stopOpacity={0.02}/></linearGradient>
                    <linearGradient id="ag" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor={AWAY.light} stopOpacity={0.15}/><stop offset="100%" stopColor={AWAY.light} stopOpacity={0.02}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 8" stroke="#ffffff06" vertical={false}/>
                  <XAxis dataKey="t" tick={{fill:"#475569",fontSize:10,fontWeight:600}} tickFormatter={G.xTick} axisLine={{stroke:"#ffffff08"}} tickLine={false}/>
                  <YAxis domain={[0,1]} tick={{fill:"#475569",fontSize:10,fontWeight:600}} tickFormatter={v => (v*100)+"%"} axisLine={false} tickLine={false} width={40}/>
                  <Tooltip content={<ChartTip/>} cursor={{stroke:"#ffffff10",strokeWidth:1}}/>
                  <ReferenceLine y={0.5} stroke="#ffffff10" strokeDasharray="8 8"/>
                  {liqLines.map(ll => (<ReferenceLine key={ll.id} y={ll.liqOnChart} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" label={{value:"⚠ LIQ "+(ll.liq*100).toFixed(0)+"%",position:"right",fill:"#f59e0b",fontSize:10,fontWeight:700}}/>))}
                  <Area type="natural" dataKey="ph" stroke={HOME.light} strokeWidth={2.5} fill="url(#hg)" dot={false} animationDuration={0} baseValue={0}/>
                  <Area type="natural" dataKey="pa" stroke={AWAY.light} strokeWidth={2} fill="url(#ag)" dot={false} animationDuration={0} baseValue={0}/>
                  <Scatter dataKey="mh_val" shape={<HomeMarkerDot/>} isAnimationActive={false}/>
                  <Scatter dataKey="ma_val" shape={<AwayMarkerDot/>} isAnimationActive={false}/>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",padding:"8px 0 12px",borderBottom:"1px solid #ffffff06",alignItems:"center"}}>
              <span style={{fontSize:10,color:"#334155",fontWeight:700,letterSpacing:"0.08em",marginRight:4,fontFamily:fm}}>ORACLE</span>
              {oracle.sources.map(s => (
                <span key={s.name} style={{fontSize:11,color:"#64748b",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:s.color,display:"inline-block"}}/>
                  {s.name} <span style={{color:s.color,fontWeight:800,fontFamily:fm}}>{(s.v*100).toFixed(1)}%</span>
                </span>
              ))}
            </div>
          </div>

          {/* Book + Positions */}
          <div style={{display:"flex",flexWrap:"wrap",borderBottom:"1px solid #ffffff06"}}>
            <div style={{flex:"0 0 280px",padding:"12px 20px",borderRight:"1px solid #ffffff06"}}>
              <div style={{fontSize:11,color:"#475569",fontWeight:800,marginBottom:6,letterSpacing:"0.06em",fontFamily:fd}}>ORDER BOOK</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <div style={{fontSize:11,fontWeight:800,color:AWAY.light,marginBottom:4}}>{AWAY.logo} Sell</div>
                  {book.asks.slice(-6).map((a,i) => { const mx = Math.max(...book.asks.map(x=>x.size)); return (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,height:22,alignItems:"center",position:"relative"}}>
                      <div style={{position:"absolute",inset:0,borderRadius:3,background:"rgba(244,63,94,"+(0.03+(a.size/mx)*0.1)+")",width:(a.size/mx)*100+"%"}}/>
                      <span style={{color:AWAY.light,position:"relative",zIndex:1,fontWeight:700,fontFamily:fm}}>{fmt3(a.price)}</span>
                      <span style={{color:"#475569",position:"relative",zIndex:1,fontFamily:fm}}>{a.size}</span>
                    </div>); })}
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:800,color:HOME.light,marginBottom:4}}>{HOME.logo} Buy</div>
                  {book.bids.slice(0,6).map((b,i) => { const mx = Math.max(...book.bids.map(x=>x.size)); return (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,height:22,alignItems:"center",position:"relative"}}>
                      <div style={{position:"absolute",inset:0,borderRadius:3,background:"rgba(16,185,129,"+(0.03+(b.size/mx)*0.1)+")",width:(b.size/mx)*100+"%"}}/>
                      <span style={{color:HOME.light,position:"relative",zIndex:1,fontWeight:700,fontFamily:fm}}>{fmt3(b.price)}</span>
                      <span style={{color:"#475569",position:"relative",zIndex:1,fontFamily:fm}}>{b.size}</span>
                    </div>); })}
                </div>
              </div>
            </div>
            <div style={{flex:1,padding:"12px 20px",minWidth:0}}>
              <div style={{fontSize:11,color:"#475569",fontWeight:800,marginBottom:8,letterSpacing:"0.06em",fontFamily:fd}}>
                OPEN POSITIONS {positions.length > 0 && <span style={{color:"#94a3b8",background:"#ffffff08",padding:"2px 8px",borderRadius:10,marginLeft:4,fontSize:10}}>{positions.length}</span>}
              </div>
              {positions.length === 0 ? (
                <div style={{textAlign:"center",fontSize:14,color:"#334155",padding:"28px 0",background:"#ffffff02",borderRadius:16,border:"1px dashed #ffffff08"}}>
                  {settled ? "All positions settled" : "Pick a team and place your first trade 👆"}
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {positions.map(pos => {
                    const pnl = calcPnL(pos.side, pos.exposure, pos.entry, oracle.price);
                    const roi = (pnl/pos.margin)*100;
                    const health = clamp(1 - Math.abs(pnl<0 ? pnl/pos.margin : 0), 0, 1);
                    const tm = pos.side==="home" ? HOME : AWAY;
                    const isW = pnl > 0;
                    return (
                      <div key={pos.id} style={{background:isW?"#022c2215":pnl<0?"#4c002215":"#ffffff03",border:"1px solid "+(isW?"#065f4640":pnl<0?"#88133740":"#ffffff08"),borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:14}}>
                        <div style={{flex:1,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                          <span style={{fontWeight:900,padding:"6px 14px",borderRadius:10,background:pos.side==="home"?"rgba(6,95,70,.38)":"rgba(136,19,55,.38)",color:pos.side==="home"?"#6ee7b7":"#fda4af",fontSize:14,display:"flex",alignItems:"center",gap:6,fontFamily:fd}}>
                            <span style={{fontSize:18}}>{tm.logo}</span> {tm.name.toUpperCase()} {pos.leverage}x
                          </span>
                          <div style={{display:"flex",gap:16,fontSize:12,color:"#94a3b8"}}>
                            <span>In <span style={{fontFamily:fm,fontWeight:700}}>{(pos.entry*100).toFixed(1)}%</span></span>
                            <span>Now <span style={{fontFamily:fm,fontWeight:700,color:"#60a5fa"}}>{(oracle.price*100).toFixed(1)}%</span></span>
                            <span>Liq <span style={{fontFamily:fm,fontWeight:700,color:"#f59e0b"}}>{(pos.liq*100).toFixed(1)}%</span></span>
                          </div>
                        </div>
                        <div style={{textAlign:"right",minWidth:110}}>
                          <div style={{fontSize:22,fontWeight:900,color:pctClr(pnl),fontFamily:fm,fontVariantNumeric:"tabular-nums",lineHeight:1}}>{fmtUsd(pnl)}</div>
                          <div style={{fontSize:13,fontWeight:700,color:pctClr(roi),fontFamily:fm,opacity:.8}}>{fmtPct(roi)}</div>
                          <div style={{marginTop:6,height:4,borderRadius:4,background:"#ffffff08",overflow:"hidden",width:110}}>
                            <div style={{height:"100%",borderRadius:4,width:health*100+"%",background:health>.5?"#10b981":health>.25?"#f59e0b":"#ef4444"}}/>
                          </div>
                        </div>
                        <button onClick={() => closePosition(pos.id)} style={{background:"linear-gradient(135deg,#dc2626,#991b1b)",border:"none",borderRadius:12,padding:"14px 22px",cursor:"pointer",color:"#fff",fontFamily:fd,fontWeight:900,fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                          <X size={16} strokeWidth={3}/> CLOSE
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Scoring */}
          <div style={{padding:"14px 20px"}}>
            <div style={{fontSize:12,color:"#475569",fontWeight:800,marginBottom:10,letterSpacing:"0.06em",display:"flex",alignItems:"center",gap:8,fontFamily:fd}}>
              <Trophy size={14} style={{color:BRAND.gold}}/> {G.playsLabel}
            </div>
            {visibleScoring.length === 0 ? (
              <div style={{textAlign:"center",fontSize:14,color:"#334155",padding:"24px 0",background:"#ffffff02",borderRadius:16,border:"1px dashed #ffffff08"}}>{G.emoji} Hit Play to start the game</div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {visibleScoring.slice(0,12).map((sp,i) => {
                  const isHome = sp.e.includes(HOME.short);
                  return (
                    <div key={sp.t+"-"+i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:i===0?(isHome?"#022c2220":"#1e1b4b20"):"#ffffff02",borderRadius:12,border:"1px solid "+(i===0?"#ffffff10":"#ffffff04"),animation:i===0?"slideIn .4s ease-out":"none"}}>
                      <div style={{fontSize:12,fontWeight:800,color:"#64748b",fontFamily:fm,width:56,textAlign:"center",flexShrink:0,background:"#ffffff06",borderRadius:8,padding:"4px 0"}}>
                        {G.periodLabel(sp.q)}<br/><span style={{fontSize:11}}>{sp.c}</span>
                      </div>
                      <div style={{fontSize:18,fontWeight:900,fontFamily:fm,fontVariantNumeric:"tabular-nums",flexShrink:0,width:70,textAlign:"center"}}>
                        <span style={{color:HOME.light}}>{sp.hs}</span>
                        <span style={{color:"#334155",margin:"0 4px"}}>-</span>
                        <span style={{color:AWAY.light}}>{sp.as}</span>
                      </div>
                      <div style={{flex:1,fontSize:14,fontWeight:700,color:isHome?HOME.light:AWAY.light,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {isHome ? HOME.logo : AWAY.logo} {sp.e.replace(/⚡/g,"").trim()}
                      </div>
                      <div style={{fontSize:14,fontWeight:900,color:"#60a5fa",fontFamily:fm,flexShrink:0}}>{(sp.p*100).toFixed(0)}%</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{width:400,borderLeft:"1px solid "+BRAND.border+"60",background:BRAND.surface}}>
          <div style={{padding:20}}>
            <div style={{fontSize:12,color:"#475569",marginBottom:14,fontWeight:800,letterSpacing:"0.06em",display:"flex",alignItems:"center",gap:8,fontFamily:fd}}>
              <Target size={14} style={{color:BRAND.accent}}/> PICK YOUR SIDE
            </div>
            <div style={{display:"flex",gap:6,marginBottom:16}}>
              {[["home",HOME],["away",AWAY]].map(([side,t]) => (
                <button key={side} onClick={() => setOrderSide(side)} style={{flex:1,padding:"14px 0",borderRadius:14,fontSize:15,fontWeight:900,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:fd,
                  background:orderSide===side?(side==="home"?"linear-gradient(135deg,#059669,#047857)":"linear-gradient(135deg,#e11d48,#be123c)"):"#ffffff06",
                  color:orderSide===side?"#fff":"#475569",
                  boxShadow:orderSide===side?(side==="home"?"0 4px 24px rgba(5,150,105,.4)":"0 4px 24px rgba(225,29,72,.4)"):"none"}}>
                  <span style={{fontSize:22}}>{t.logo}</span> {t.name.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:6,fontWeight:700}}>Margin</div>
                <div style={{display:"flex",alignItems:"center",background:"#ffffff04",border:"1px solid #ffffff08",borderRadius:10,overflow:"hidden"}}>
                  <span style={{paddingLeft:10,color:"#475569",fontSize:14,fontWeight:800}}>$</span>
                  <input type="number" value={orderMargin} onChange={e => setOrderMargin(Math.max(0,+e.target.value))} style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#e2e8f0",fontSize:15,padding:"10px 8px",fontWeight:800,fontFamily:fm,width:"100%",minWidth:0}}/>
                </div>
                <div style={{display:"flex",gap:4,marginTop:6}}>
                  {[250,500,1000,2500].map(v => (
                    <button key={v} onClick={() => setOrderMargin(v)} style={{flex:1,padding:"5px 0",borderRadius:6,fontSize:11,fontWeight:800,border:"none",cursor:"pointer",background:orderMargin===v?"#334155":"#ffffff04",color:orderMargin===v?"#e2e8f0":"#475569",fontFamily:fm}}>{v>=1000?(v/1000)+"k":v}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
                  <span style={{color:"#64748b",fontWeight:700}}>Leverage</span>
                  <span style={{color:BRAND.gold,fontWeight:800,fontSize:11}}>{ml}x max</span>
                </div>
                <div style={{display:"flex",gap:4}}>
                  {[2,3,5,10].map(l => (
                    <button key={l} onClick={() => setOrderLev(l)} disabled={l > ml} style={{flex:1,padding:"10px 0",borderRadius:10,fontSize:15,fontWeight:900,border:"none",cursor:l>ml?"not-allowed":"pointer",fontFamily:fm,
                      background:l>ml?"#ffffff02":orderLev===l?"linear-gradient(135deg,"+BRAND.accent+",#4f46e5)":"#ffffff06",
                      color:l>ml?"#1e293b":orderLev===l?"#fff":"#64748b"}}>{l}x</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{background:"#ffffff03",border:"1px solid #ffffff08",borderRadius:16,padding:16,marginBottom:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                <div style={{background:"#ffffff04",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{fontSize:11,color:"#475569",fontWeight:700,marginBottom:2}}>Exposure</div>
                  <div style={{fontSize:18,fontWeight:900,fontFamily:fm}}>{fmtUsd(expo)}</div>
                </div>
                <div style={{background:"#ffffff04",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{fontSize:11,color:"#475569",fontWeight:700,marginBottom:2}}>Liquidation</div>
                  <div style={{fontSize:18,fontWeight:900,color:BRAND.gold,fontFamily:fm}}>{(liqP*100).toFixed(1)}%</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:orderSide==="home"?"#022c2220":"#4c002220",borderRadius:12,border:"1px solid "+(orderSide==="home"?"#065f4630":"#88133730")}}>
                <span style={{color:"#94a3b8",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                  <DollarSign size={14} style={{color:BRAND.green}}/> If {team.name} win
                </span>
                <span style={{color:BRAND.green,fontWeight:900,fontSize:16,fontFamily:fm}}>
                  +{fmtUsd(orderSide==="home" ? expo*(1-oracle.price)/oracle.price : expo*oracle.price/(1-oracle.price))}
                </span>
              </div>
            </div>
            <button onClick={placeOrder} disabled={settled || eM<10} style={{width:"100%",padding:"16px 0",borderRadius:14,fontWeight:900,fontSize:15,border:"none",cursor:settled?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,color:"#fff",fontFamily:fd,
              background:settled?"#334155":orderSide==="home"?"linear-gradient(135deg,#059669,#047857)":"linear-gradient(135deg,#e11d48,#be123c)",
              opacity:settled||eM<10?0.3:1,
              boxShadow:settled?"none":orderSide==="home"?"0 6px 28px rgba(5,150,105,.45)":"0 6px 28px rgba(225,29,72,.45)"}}>
              {settled ? "MARKET SETTLED" : (<>{team.logo} {team.name.toUpperCase()} — {fmtUsd(eM)} x {eL}</>)}
            </button>

            {/* Trade History */}
            <div style={{marginTop:24}}>
              <div style={{fontSize:12,color:"#475569",fontWeight:800,marginBottom:10,letterSpacing:"0.06em",fontFamily:fd}}>
                TRADE HISTORY {closedPos.length > 0 && <span style={{color:"#94a3b8",background:"#ffffff08",padding:"2px 8px",borderRadius:10,fontSize:10}}>{closedPos.length}</span>}
              </div>
              {closedPos.length === 0 ? (
                <div style={{textAlign:"center",fontSize:13,color:"#334155",padding:"24px 0",background:"#ffffff02",borderRadius:16,border:"1px dashed #ffffff08"}}>No trades yet</div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {closedPos.map((cp,i) => {
                    const tm = cp.side==="home" ? HOME : AWAY;
                    const roi = (cp.pnl/cp.margin)*100;
                    const sBg = cp.closeType==="LIQ"?"#450a0a":cp.closeType==="SETTLED"?"#172554":cp.pnl>=0?"#022c22":"#1e293b";
                    const sClr = cp.closeType==="LIQ"?"#fda4af":cp.closeType==="SETTLED"?"#93c5fd":cp.pnl>=0?"#6ee7b7":"#94a3b8";
                    return (
                      <div key={cp.id+"-"+i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#ffffff02",borderRadius:12,border:"1px solid #ffffff06"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,flex:"0 0 auto"}}>
                          <span style={{fontSize:16}}>{tm.logo}</span>
                          <span style={{fontWeight:800,color:cp.side==="home"?"#6ee7b7":"#fda4af",fontSize:13}}>{tm.short}</span>
                          <span style={{color:"#475569",fontWeight:700,fontSize:12}}>{cp.leverage}x</span>
                        </div>
                        <div style={{flex:1,display:"flex",gap:8,fontSize:12,color:"#64748b",fontFamily:fm}}>
                          <span>{(cp.entry*100).toFixed(1)}%</span><span style={{color:"#334155"}}>→</span><span>{(cp.closedAt*100).toFixed(1)}%</span>
                        </div>
                        <div style={{fontWeight:900,fontSize:14,color:pctClr(cp.pnl),fontFamily:fm,fontVariantNumeric:"tabular-nums",textAlign:"right"}}>
                          {fmtUsd(cp.pnl)} <span style={{fontSize:11,opacity:.7}}>{fmtPct(roi)}</span>
                        </div>
                        <span style={{fontSize:11,fontWeight:900,padding:"3px 8px",borderRadius:6,background:sBg,color:sClr,flexShrink:0}}>{cp.closeType}</span>
                      </div>
                    );
                  })}
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",fontSize:12,background:"#ffffff03",borderRadius:10,marginTop:2}}>
                    <span style={{color:"#475569",fontWeight:700}}>{closedPos.length} trade{closedPos.length!==1?"s":""}</span>
                    <span style={{fontWeight:900,color:pctClr(closedPnL),fontFamily:fm}}>Net: {fmtUsd(closedPnL)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{position:"sticky",bottom:0,borderTop:"1px solid #ffffff08",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,background:BRAND.bg+"ee",backdropFilter:"blur(20px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={() => { if (settled) resetAll(); else setPlaying(p => !p); }} style={{width:44,height:44,borderRadius:12,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",
            background:playing?"linear-gradient(135deg,#dc2626,#991b1b)":"linear-gradient(135deg,"+BRAND.accent+",#4f46e5)"}}>
            {playing ? <Pause size={20}/> : <Play size={20}/>}
          </button>
          <button onClick={resetAll} style={{width:44,height:44,borderRadius:12,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",background:"#ffffff06"}}>
            <RotateCcw size={18}/>
          </button>
          <div style={{display:"flex",gap:4,marginLeft:10}}>
            {[5,10,25,50].map(s => (
              <button key={s} onClick={() => setSpeed(s)} style={{padding:"8px 14px",borderRadius:8,fontSize:12,fontWeight:900,border:"none",cursor:"pointer",fontFamily:fm,
                background:speed===s?"linear-gradient(135deg,"+BRAND.accent+",#4f46e5)":"#ffffff06",
                color:speed===s?"#fff":"#475569"}}>{s}x</button>
            ))}
          </div>
        </div>
        <div style={{flex:"1 1 0",maxWidth:480,margin:"0 20px"}}>
          <div style={{height:6,borderRadius:6,background:"#ffffff06",overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:6,width:(gameTime/60)*100+"%",background:"linear-gradient(90deg,"+BRAND.accent+","+BRAND.neon+")"}}/>
          </div>
        </div>
        <div style={{fontSize:12,color:"#475569",fontWeight:800,fontFamily:fm}}>{gameTime.toFixed(1)}/60</div>
      </div>

      {/* Settlement */}
      {settled && (
        <div style={{position:"fixed",inset:0,zIndex:40,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.8)",backdropFilter:"blur(16px)"}}>
          <div style={{textAlign:"center",borderRadius:28,padding:"48px 48px 40px",maxWidth:440,margin:"0 16px",background:"linear-gradient(180deg,"+BRAND.surface+","+BRAND.bg+")",border:"2px solid #065f46"}}>
            <div style={{fontSize:64,marginBottom:16}}>{HOME.logo}</div>
            <div style={{fontSize:32,fontWeight:900,color:HOME.light,marginBottom:4,fontFamily:fd}}>{HOME.name.toUpperCase()} WIN</div>
            <div style={{fontSize:18,fontWeight:700,color:"#94a3b8",marginBottom:4}}>{gameState.hs} – {gameState.as}</div>
            <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>{G.sport} · {G.label}</div>
            <div style={{fontSize:44,fontWeight:900,color:totalEq>=10000?BRAND.green:"#f43f5e",fontFamily:fm,fontVariantNumeric:"tabular-nums",marginBottom:4}}>{fmtUsd(totalEq)}</div>
            <div style={{fontSize:16,marginBottom:36}}>
              <span style={{color:"#64748b"}}>Return </span>
              <span style={{fontWeight:800,color:pctClr(totalEq-10000),fontFamily:fm}}>{fmtPct((totalEq-10000)/100)}</span>
              <span style={{color:"#475569"}}> on $10,000</span>
            </div>
            <div style={{display:"flex",gap:12,justifyContent:"center"}}>
              <button onClick={resetAll} style={{padding:"14px 32px",borderRadius:14,fontWeight:900,fontSize:15,border:"none",cursor:"pointer",color:"#fff",fontFamily:fd,background:"linear-gradient(135deg,"+BRAND.accent+",#4f46e5)"}}>Replay</button>
              <button onClick={onChangeGame} style={{padding:"14px 32px",borderRadius:14,fontWeight:900,fontSize:15,border:"1px solid "+BRAND.border,cursor:"pointer",color:"#94a3b8",fontFamily:fd,background:"transparent"}}>Other Games</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("landing");
  const [selectedGame, setSelectedGame] = useState(null);

  const handleSelectGame = (game) => { setSelectedGame(game); setPage("trading"); };

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        button:hover:not(:disabled) { filter: brightness(1.12); }
        button:active:not(:disabled) { transform: scale(0.98); }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
      {page === "landing" ? (
        <LandingPage onLaunch={() => setPage("select")} />
      ) : page === "select" ? (
        <GameSelector onSelect={handleSelectGame} onBack={() => setPage("landing")} />
      ) : selectedGame ? (
        <TradingApp game={selectedGame} onBack={() => setPage("landing")} onChangeGame={() => setPage("select")} />
      ) : null}
    </div>
  );
}
