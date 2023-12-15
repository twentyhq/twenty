'use strict';

var react = require('@emotion/react');
var Pn = require('hex-rgb');
var F = require('@emotion/styled');
var iconsReact = require('@tabler/icons-react');
var jsxRuntime = require('react/jsx-runtime');
var framerMotion = require('framer-motion');
var ze = require('react');
var reactDom = require('react-dom');
var uuid = require('uuid');
var reactTooltip = require('react-tooltip');
var reactRouterDom = require('react-router-dom');
var guards = require('@sniptt/guards');
var zod = require('zod');
var wi = require('react-textarea-autosize');
var reactHotkeysHook = require('react-hotkeys-hook');
var recoil = require('recoil');
var react$2 = require('@floating-ui/react');
var tsKeyEnum = require('ts-key-enum');
var yc = require('deep-equal');
var Lc = require('lodash.debounce');
var react$1 = require('@blocknote/react');
var reactResponsive = require('react-responsive');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var Pn__default = /*#__PURE__*/_interopDefault(Pn);
var F__default = /*#__PURE__*/_interopDefault(F);
var ze__namespace = /*#__PURE__*/_interopNamespace(ze);
var wi__default = /*#__PURE__*/_interopDefault(wi);
var yc__default = /*#__PURE__*/_interopDefault(yc);
var Lc__default = /*#__PURE__*/_interopDefault(Lc);

var p={gray100:"#000000",gray90:"#141414",gray85:"#171717",gray80:"#1b1b1b",gray75:"#1d1d1d",gray70:"#222222",gray65:"#292929",gray60:"#333333",gray55:"#4c4c4c",gray50:"#666666",gray45:"#818181",gray40:"#999999",gray35:"#b3b3b3",gray30:"#cccccc",gray25:"#d6d6d6",gray20:"#ebebeb",gray15:"#f1f1f1",gray10:"#fcfcfc",gray0:"#ffffff"},Eo={green:"#55ef3c",turquoise:"#15de8f",sky:"#00e0ff",blue:"#1961ed",purple:"#915ffd",pink:"#f54bd0",red:"#f83e3e",orange:"#ff7222",yellow:"#ffd338",gray:p.gray30},Ho=Object.keys(Eo),Ln={yellow80:"#2e2a1a",yellow70:"#453d1e",yellow60:"#746224",yellow50:"#b99b2e",yellow40:"#ffe074",yellow30:"#ffedaf",yellow20:"#fff6d7",yellow10:"#fffbeb",green80:"#1d2d1b",green70:"#23421e",green60:"#2a5822",green50:"#42ae31",green40:"#88f477",green30:"#ccfac5",green20:"#ddfcd8",green10:"#eefdec",turquoise80:"#172b23",turquoise70:"#173f2f",turquoise60:"#166747",turquoise50:"#16a26b",turquoise40:"#5be8b1",turquoise30:"#a1f2d2",turquoise20:"#d0f8e9",turquoise10:"#e8fcf4",sky80:"#152b2e",sky70:"#123f45",sky60:"#0e6874",sky50:"#07a4b9",sky40:"#4de9ff",sky30:"#99f3ff",sky20:"#ccf9ff",sky10:"#e5fcff",blue80:"#171e2c",blue70:"#172642",blue60:"#18356d",blue50:"#184bad",blue40:"#5e90f2",blue30:"#a3c0f8",blue20:"#d1dffb",blue10:"#e8effd",purple80:"#231e2e",purple70:"#2f2545",purple60:"#483473",purple50:"#6c49b8",purple40:"#b28ffe",purple30:"#d3bffe",purple20:"#e9dfff",purple10:"#f4efff",pink80:"#2d1c29",pink70:"#43213c",pink60:"#702c61",pink50:"#b23b98",pink40:"#f881de",pink30:"#fbb7ec",pink20:"#fddbf6",pink10:"#feedfa",red80:"#2d1b1b",red70:"#441f1f",red60:"#712727",red50:"#b43232",red40:"#fa7878",red30:"#fcb2b2",red20:"#fed8d8",red10:"#feecec",orange80:"#2e2018",orange70:"#452919",orange60:"#743b1b",orange50:"#b9571f",orange40:"#ff9c64",orange30:"#ffc7a7",orange20:"#ffe3d3",orange10:"#fff1e9",gray80:p.gray70,gray70:p.gray65,gray60:p.gray55,gray50:p.gray40,gray40:p.gray25,gray30:p.gray20,gray20:p.gray15,gray10:p.gray10,blueAccent90:"#141a25",blueAccent85:"#151d2e",blueAccent80:"#152037",blueAccent75:"#16233f",blueAccent70:"#17294a",blueAccent60:"#18356d",blueAccent40:"#a3c0f8",blueAccent35:"#c8d9fb",blueAccent25:"#dae6fc",blueAccent20:"#e2ecfd",blueAccent15:"#edf2fe",blueAccent10:"#f5f9fd"},d={...Eo,...Ln},f=(e,o)=>`rgba(${Pn__default.default(e,{format:"array"}).slice(0,-1).join(",")},${o})`;var Mo={primary:d.blueAccent25,secondary:d.blueAccent20,tertiary:d.blueAccent15,quaternary:d.blueAccent10,accent3570:d.blueAccent35,accent4060:d.blueAccent40},Ao={primary:d.blueAccent75,secondary:d.blueAccent80,tertiary:d.blueAccent85,quaternary:d.blueAccent90,accent3570:d.blueAccent70,accent4060:d.blueAccent60};var Do={duration:{instant:.075,fast:.15,normal:.3}};var Fo="./dark-noise-JHVNKF2E.jpg";var zo="./light-noise-JRI6I6YG.png";var No={noisy:`url(${zo.toString()});`,primary:p.gray0,secondary:p.gray10,tertiary:p.gray15,quaternary:p.gray20,danger:d.red10,transparent:{primary:f(p.gray0,.8),secondary:f(p.gray10,.8),strong:f(p.gray100,.16),medium:f(p.gray100,.08),light:f(p.gray100,.04),lighter:f(p.gray100,.02),danger:f(d.red,.08)},overlay:f(p.gray80,.8),radialGradient:`radial-gradient(50% 62.62% at 50% 0%, #505050 0%, ${p.gray60} 100%)`,radialGradientHover:`radial-gradient(76.32% 95.59% at 50% 0%, #505050 0%, ${p.gray60} 100%)`},Uo={noisy:`url(${Fo.toString()});`,primary:p.gray85,secondary:p.gray80,tertiary:p.gray75,quaternary:p.gray70,danger:d.red80,transparent:{primary:f(p.gray85,.8),secondary:f(p.gray80,.8),strong:f(p.gray0,.14),medium:f(p.gray0,.1),light:f(p.gray0,.06),lighter:f(p.gray0,.03),danger:f(d.red,.08)},overlay:f(p.gray80,.8),radialGradient:`radial-gradient(50% 62.62% at 50% 0%, #505050 0%, ${p.gray60} 100%)`,radialGradientHover:`radial-gradient(76.32% 95.59% at 50% 0%, #505050 0%, ${p.gray60} 100%)`};var Oo={light:"blur(6px)",strong:"blur(20px)"};var Vo={radius:{xs:"2px",sm:"4px",md:"8px",xl:"20px",pill:"999px",rounded:"100%"}},Wo={color:{strong:p.gray25,medium:p.gray20,light:p.gray15,secondaryInverted:p.gray50,inverted:p.gray60,danger:d.red20},...Vo},Yo={color:{strong:p.gray55,medium:p.gray65,light:p.gray70,secondaryInverted:p.gray35,inverted:p.gray20,danger:d.red70},...Vo};var Xo={extraLight:`0px 1px 0px 0px ${f(p.gray100,.04)}`,light:`0px 2px 4px 0px ${f(p.gray100,.04)}, 0px 0px 4px 0px ${f(p.gray100,.08)}`,strong:`2px 4px 16px 0px ${f(p.gray100,.12)}, 0px 2px 4px 0px ${f(p.gray100,.04)}`,underline:`0px 1px 0px 0px ${f(p.gray100,.32)}`},_o={extraLight:`0px 1px 0px 0px ${f(p.gray100,.04)}`,light:`0px 2px 4px 0px ${f(p.gray100,.04)}, 0px 0px 4px 0px ${f(p.gray100,.08)}`,strong:`2px 4px 16px 0px ${f(p.gray100,.16)}, 0px 2px 4px 0px ${f(p.gray100,.08)}`,underline:`0px 1px 0px 0px ${f(p.gray100,.32)}`};var Go={size:{xxs:"0.625rem",xs:"0.85rem",sm:"0.92rem",md:"1rem",lg:"1.23rem",xl:"1.54rem",xxl:"1.85rem"},weight:{regular:400,medium:500,semiBold:600},family:"Inter, sans-serif"},qo={color:{primary:p.gray60,secondary:p.gray50,tertiary:p.gray40,light:p.gray35,extraLight:p.gray30,inverted:p.gray0,danger:d.red},...Go},Ko={color:{primary:p.gray20,secondary:p.gray35,tertiary:p.gray45,light:p.gray50,extraLight:p.gray55,inverted:p.gray100,danger:d.red},...Go};var Qo={size:{sm:14,md:16,lg:20,xl:40},stroke:{sm:1.6,md:2,lg:2.5}};var Jo={size:{sm:"300px",md:"400px",lg:"53%"}};var Zo={text:{green:d.green60,turquoise:d.turquoise60,sky:d.sky60,blue:d.blue60,purple:d.purple60,pink:d.pink60,red:d.red60,orange:d.orange60,yellow:d.yellow60,gray:d.gray60},background:{green:d.green20,turquoise:d.turquoise20,sky:d.sky20,blue:d.blue20,purple:d.purple20,pink:d.pink20,red:d.red20,orange:d.orange20,yellow:d.yellow20,gray:d.gray20}},jo={text:{green:d.green10,turquoise:d.turquoise10,sky:d.sky10,blue:d.blue10,purple:d.purple10,pink:d.pink10,red:d.red10,orange:d.orange10,yellow:d.yellow10,gray:d.gray10},background:{green:d.green60,turquoise:d.turquoise60,sky:d.sky60,blue:d.blue60,purple:d.purple60,pink:d.pink60,red:d.red60,orange:d.orange60,yellow:d.yellow60,gray:d.gray60}};var et={lineHeight:{lg:1.5,md:1.2},iconSizeMedium:16,iconSizeSmall:14,iconStrikeLight:1.6,iconStrikeMedium:2,iconStrikeBold:2.5};var ot={color:d,grayScale:p,icon:Qo,modal:Jo,text:et,blur:Oo,animation:Do,snackBar:{success:{background:"#16A26B",color:"#D0F8E9"},error:{background:"#B43232",color:"#FED8D8"},info:{background:d.gray80,color:p.gray0}},spacingMultiplicator:4,spacing:(...e)=>e.map(o=>`${o*4}px`).join(" "),betweenSiblingsGap:"2px",table:{horizontalCellMargin:"8px",checkboxColumnWidth:"32px"},rightDrawerWidth:"500px",clickableElementBackgroundTransition:"background 0.1s ease",lastLayerZIndex:2147483647},En={...ot,accent:Mo,background:No,border:Wo,tag:Zo,boxShadow:Xo,font:qo,name:"light"},Hn={...ot,accent:Ao,background:Uo,border:Yo,tag:jo,boxShadow:_o,font:Ko,name:"dark"},Y=768;var Dn=F__default.default.div`
  align-items: center;
  background-color: ${({theme:e})=>e.color.blue};
  border-radius: 50%;
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;
`,Oe=({className:e})=>{let o=react.useTheme();return jsxRuntime.jsx(Dn,{className:e,children:jsxRuntime.jsx(iconsReact.IconCheck,{color:o.grayScale.gray0,size:14})})};var ht=({isAnimating:e=!1,color:o,duration:r=.5,size:t=28})=>{let n=react.useTheme();return jsxRuntime.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 52 52",width:t,height:t,children:jsxRuntime.jsx(framerMotion.motion.path,{fill:"none",stroke:o??n.grayScale.gray0,strokeWidth:4,d:"M14 27l7.8 7.8L38 14",pathLength:"1",strokeDasharray:"1",strokeDashoffset:e?"1":"0",animate:{strokeDashoffset:e?"0":"1"},transition:{duration:r}})})};var On=(n=>(n.Top="top",n.Left="left",n.Right="right",n.Bottom="bottom",n))(On||{}),Vn=F__default.default(reactTooltip.Tooltip)`
  backdrop-filter: ${({theme:e})=>e.blur.strong};
  background-color: ${({theme:e})=>f(e.color.gray80,.8)};
  border-radius: ${({theme:e})=>e.border.radius.sm};

  box-shadow: ${({theme:e})=>e.boxShadow.light};
  color: ${({theme:e})=>e.grayScale.gray0};

  font-size: ${({theme:e})=>e.font.size.sm};
  font-weight: ${({theme:e})=>e.font.weight.regular};

  max-width: 40%;
  overflow: visible;

  padding: ${({theme:e})=>e.spacing(2)};

  word-break: break-word;

  z-index: ${({theme:e})=>e.lastLayerZIndex};
`,xt=({anchorSelect:e,className:o,content:r,delayHide:t,isOpen:n,noArrow:a,offset:i,place:c,positionStrategy:s})=>jsxRuntime.jsx(Vn,{anchorSelect:e,className:o,content:r,delayHide:t,isOpen:n,noArrow:a,offset:i,place:c,positionStrategy:s});var Qn=F__default.default.div`
  cursor: ${({cursorPointer:e})=>e?"pointer":"inherit"};
  font-family: inherit;
  font-size: inherit;

  font-weight: inherit;
  max-width: 100%;
  overflow: hidden;
  text-decoration: inherit;

  text-overflow: ellipsis;
  white-space: nowrap;
`,X=({text:e,className:o})=>{let r=`title-id-${uuid.v4()}`,t=ze.useRef(null),[n,a]=ze.useState(!1);return ze.useEffect(()=>{let c=(e?.length??0)>0&&t.current?t.current?.scrollHeight>t.current?.clientHeight||t.current.scrollWidth>t.current.clientWidth:!1;n!==c&&a(c);},[n,e]),jsxRuntime.jsxs(jsxRuntime.Fragment,{children:[jsxRuntime.jsx(Qn,{"data-testid":"tooltip",className:o,ref:t,id:r,cursorPointer:n,children:e}),n&&reactDom.createPortal(jsxRuntime.jsx("div",{onClick:c=>{c.stopPropagation(),c.preventDefault();},children:jsxRuntime.jsx(xt,{anchorSelect:`#${r}`,content:e??"",delayHide:0,offset:5,noArrow:!0,place:"bottom",positionStrategy:"absolute"})}),document.body)]})};var kt=(r=>(r.Large="large",r.Small="small",r))(kt||{}),jn=(r=>(r.TextPrimary="text-primary",r.TextSecondary="text-secondary",r))(jn||{}),We=(n=>(n.Highlighted="highlighted",n.Regular="regular",n.Transparent="transparent",n.Rounded="rounded",n))(We||{}),ea=F__default.default.div`
  align-items: center;

  background-color: ${({theme:e,variant:o})=>o==="highlighted"?e.background.transparent.light:o==="rounded"?e.background.transparent.lighter:"transparent"};
  border-color: ${({theme:e,variant:o})=>o==="rounded"?e.border.color.medium:"none"};
  border-radius: ${({theme:e,variant:o})=>o==="rounded"?"50px":e.border.radius.sm};
  border-style: ${({variant:e})=>e==="rounded"?"solid":"none"};
  border-width: ${({variant:e})=>e==="rounded"?"1px":"0px"};

  color: ${({theme:e,disabled:o,accent:r})=>o?e.font.color.light:r==="text-primary"?e.font.color.primary:e.font.color.secondary};
  cursor: ${({clickable:e,disabled:o,variant:r})=>o||r==="transparent"?"inherit":e?"pointer":"inherit"};
  display: inline-flex;
  font-weight: ${({theme:e,accent:o})=>o==="text-secondary"?e.font.weight.medium:"inherit"};
  gap: ${({theme:e})=>e.spacing(1)};

  height: ${({size:e})=>e==="large"?"16px":"12px"};
  max-width: ${({maxWidth:e})=>e||"200px"};

  overflow: hidden;
  padding: ${({theme:e,variant:o})=>o==="rounded"?"3px 8px":e.spacing(1)};
  user-select: none;

  :hover {
    ${({variant:e,theme:o,disabled:r})=>{if(!r)return "background-color: "+(e==="highlighted"?o.background.transparent.medium:e==="regular"?o.background.transparent.light:"transparent")+";"}}
  }
  :active {
    ${({variant:e,theme:o,disabled:r})=>{if(!r)return "background-color: "+(e==="highlighted"?o.background.transparent.strong:e==="regular"?o.background.transparent.medium:"transparent")+";"}}
  }
`,oa=F__default.default.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,ie=({size:e="small",label:o,disabled:r=!1,clickable:t=!0,variant:n="regular",leftComponent:a,rightComponent:i,accent:c="text-primary",maxWidth:s,className:m,onClick:l})=>jsxRuntime.jsxs(ea,{"data-testid":"chip",clickable:t,variant:n,accent:c,size:e,disabled:r,className:m,maxWidth:s,onClick:l,children:[a,jsxRuntime.jsx(oa,{children:jsxRuntime.jsx(X,{text:o})}),i]});var Ye=(e,o,r)=>{let t=0;for(let a=0;a<e.length;a++)t=e.charCodeAt(a)+((t<<5)-t);return "hsl("+t%360+", "+o+"%, "+r+"%)"};var Ct=window._env_?.REACT_APP_SERVER_BASE_URL||process.env.REACT_APP_SERVER_BASE_URL||"http://localhost:3000";window._env_?.REACT_APP_SERVER_AUTH_URL||process.env.REACT_APP_SERVER_AUTH_URL||Ct+"/auth";var vt=window._env_?.REACT_APP_SERVER_FILES_URL||process.env.REACT_APP_SERVER_FILES_URL||Ct+"/files";var Xe=e=>e?e?.startsWith("data:")||e?.startsWith("https:")?e:`${vt}/${e}`:null;var ia=F__default.default.div`
  align-items: center;
  background-color: ${({avatarUrl:e,colorId:o})=>guards.isNonEmptyString(e)?"none":Ye(o,75,85)};
  ${({avatarUrl:e})=>guards.isNonEmptyString(e)?`background-image: url(${e});`:""}
  background-position: center;
  background-size: cover;
  border-radius: ${e=>e.type==="rounded"?"50%":"2px"};
  color: ${({colorId:e})=>Ye(e,75,25)};
  cursor: ${({onClick:e})=>e?"pointer":"default"};
  display: flex;

  flex-shrink: 0;
  font-size: ${({size:e})=>{switch(e){case"xl":return "16px";case"lg":return "13px";case"md":default:return "12px";case"sm":return "10px";case"xs":return "8px"}}};
  font-weight: ${({theme:e})=>e.font.weight.medium};

  height: ${({size:e})=>{switch(e){case"xl":return "40px";case"lg":return "24px";case"md":default:return "16px";case"sm":return "14px";case"xs":return "12px"}}};
  justify-content: center;
  width: ${({size:e})=>{switch(e){case"xl":return "40px";case"lg":return "24px";case"md":default:return "16px";case"sm":return "14px";case"xs":return "12px"}}};

  &:hover {
    box-shadow: ${({theme:e,onClick:o})=>o?"0 0 0 4px "+e.background.transparent.light:"unset"};
  }
`,$t=({avatarUrl:e,className:o,size:r="md",placeholder:t,colorId:n=t,onClick:a,type:i="squared"})=>{let c=!guards.isNonEmptyString(e),[s,m]=ze.useState(!1);return ze.useEffect(()=>{e&&new Promise(l=>{let u=new Image;u.onload=()=>l(!1),u.onerror=()=>l(!0),u.src=Xe(e);}).then(l=>{m(l);});},[e]),jsxRuntime.jsx(ia,{className:o,avatarUrl:Xe(e),placeholder:t,size:r,type:i,colorId:n??"",onClick:a,children:(c||s)&&t?.[0]?.toLocaleUpperCase()})};var da=(r=>(r.Regular="regular",r.Transparent="transparent",r))(da||{}),$u=({linkToEntity:e,entityId:o,name:r,avatarUrl:t,avatarType:n="rounded",variant:a="regular",LeftIcon:i,className:c})=>{let s=reactRouterDom.useNavigate(),m=react.useTheme(),l=u=>{e&&(u.preventDefault(),u.stopPropagation(),s(e));};return guards.isNonEmptyString(r)?jsxRuntime.jsx(ie,{label:r,variant:e?a==="regular"?"highlighted":"regular":"transparent",leftComponent:i?jsxRuntime.jsx(i,{size:m.icon.size.md,stroke:m.icon.stroke.sm}):jsxRuntime.jsx($t,{avatarUrl:t,colorId:o,placeholder:r,size:"sm",type:n}),clickable:!!e,onClick:l,className:c}):jsxRuntime.jsx(jsxRuntime.Fragment,{})};var ua=e=>jsxRuntime.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",className:"icon icon-tabler icon-tabler-address-book",width:24,height:24,viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor",fill:"none",strokeLinecap:"round",strokeLinejoin:"round",...e,children:[jsxRuntime.jsx("path",{stroke:"none",d:"M0 0h24v24H0z",fill:"none"}),jsxRuntime.jsx("path",{d:"M20 6v12a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2z"}),jsxRuntime.jsx("path",{d:"M10 16h6"}),jsxRuntime.jsx("path",{d:"M13 11m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"}),jsxRuntime.jsx("path",{d:"M4 8h3"}),jsxRuntime.jsx("path",{d:"M4 12h3"}),jsxRuntime.jsx("path",{d:"M4 16h3"})]}),wt=ua;var Eu=e=>{let o=e.size??24,r=e.stroke??2;return jsxRuntime.jsx(wt,{height:o,width:o,strokeWidth:r})};var ba=F__default.default.span`
  align-items: center;
  background: ${({theme:e})=>e.background.transparent.light};
  border-radius: ${({theme:e})=>e.border.radius.pill};
  color: ${({theme:e})=>e.font.color.light};
  display: inline-block;
  font-size: ${({theme:e})=>e.font.size.xs};
  font-style: normal;
  font-weight: ${({theme:e})=>e.font.weight.medium};
  gap: ${({theme:e})=>e.spacing(2)};
  height: ${({theme:e})=>e.spacing(4)};
  justify-content: flex-end;
  line-height: ${({theme:e})=>e.text.lineHeight.lg};
  padding: ${({theme:e})=>`0 ${e.spacing(2)}`};
`,Tt=({className:e})=>jsxRuntime.jsx(ba,{className:e,children:"Soon"});var Pt=zod.z.enum(Ho);var Sa=F__default.default.h3`
  align-items: center;
  background: ${({color:e,theme:o})=>o.tag.background[e]};
  border-radius: ${({theme:e})=>e.border.radius.sm};
  color: ${({color:e,theme:o})=>o.tag.text[e]};
  display: inline-flex;
  font-size: ${({theme:e})=>e.font.size.md};
  font-style: normal;
  font-weight: ${({theme:e})=>e.font.weight.regular};
  height: ${({theme:e})=>e.spacing(5)};
  margin: 0;
  overflow: hidden;
  padding: 0 ${({theme:e})=>e.spacing(2)};
`,Ia=F__default.default.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,Yu=({className:e,color:o,text:r,onClick:t})=>jsxRuntime.jsx(Sa,{className:e,color:Pt.catch("gray").parse(o),onClick:t,children:jsxRuntime.jsx(Ia,{children:r})});var La=F__default.default.div`
  height: ${({barHeight:e})=>e}px;
  overflow: hidden;
  width: 100%;
`,Ra=F__default.default(framerMotion.motion.div)`
  height: 100%;
  width: 100%;
`,Zu=ze.forwardRef(({duration:e=3,delay:o=0,easing:r="easeInOut",barHeight:t=24,barColor:n,autoStart:a=!0,className:i},c)=>{let s=react.useTheme(),m=framerMotion.useAnimation(),l=ze.useRef(0),u=ze.useRef(e),g=ze.useCallback(async()=>(l.current=Date.now(),m.start({scaleX:0,transition:{duration:u.current/1e3,delay:o/1e3,ease:r}})),[m,o,r]);return ze.useImperativeHandle(c,()=>({...m,start:async()=>g(),pause:async()=>{let x=Date.now()-l.current;return u.current=u.current-x,m.stop()}})),ze.useEffect(()=>{a&&g();},[m,o,e,r,a,g]),jsxRuntime.jsx(La,{className:i,barHeight:t,children:jsxRuntime.jsx(Ra,{style:{originX:0,backgroundColor:n??s.color.gray80},initial:{scaleX:1},animate:m,exit:{scaleX:0}})})});var ng=({size:e=50,barWidth:o=5,barColor:r="currentColor"})=>{let t=framerMotion.useAnimation(),n=ze.useMemo(()=>2*Math.PI*(e/2-o),[e,o]);return ze.useEffect(()=>{(async()=>{let i=Math.max(5,n/10),c=[`${i} ${n-i}`,`${i*2} ${n-i*2}`,`${i*3} ${n-i*3}`,`${i*2} ${n-i*2}`,`${i} ${n-i}`];await t.start({strokeDasharray:c,rotate:[0,720],transition:{strokeDasharray:{duration:2,ease:"linear",repeat:1/0,repeatType:"loop"},rotate:{duration:2,ease:"linear",repeat:1/0,repeatType:"loop"}}});})();},[n,t]),jsxRuntime.jsx(framerMotion.motion.svg,{width:e,height:e,animate:t,children:jsxRuntime.jsx(framerMotion.motion.circle,{cx:e/2,cy:e/2,r:e/2-o,fill:"none",stroke:r,strokeWidth:o,strokeLinecap:"round"})})};var Aa=F__default.default.button`
  align-items: center;
  ${({theme:e,variant:o,accent:r,disabled:t,focus:n})=>{switch(o){case"primary":switch(r){case"default":return `
              background: ${e.background.secondary};
              border-color: ${t?"transparent":n?e.color.blue:e.background.transparent.light};
              color: ${t?e.font.color.extraLight:e.font.color.secondary};
              border-width: ${!t&&n?"1px 1px !important":0};
              box-shadow: ${!t&&n?`0 0 0 3px ${e.accent.tertiary}`:"none"};
              &:hover {
                background: ${t?e.background.secondary:e.background.tertiary};
              }
              &:active {
                background: ${t?e.background.secondary:e.background.quaternary};
              }
            `;case"blue":return `
              background: ${t?e.color.blue20:e.color.blue};
              border-color: ${t?"transparent":n?e.color.blue:e.background.transparent.light};
              border-width: ${!t&&n?"1px 1px !important":0};
              color: ${e.grayScale.gray0};
              box-shadow: ${!t&&n?`0 0 0 3px ${e.accent.tertiary}`:"none"};
              &:hover {
                background: ${t?e.color.blue20:e.color.blue50};
              }
              &:active {
                background: ${t?e.color.blue20:e.color.blue60};
              }
            `;case"danger":return `
              background: ${t?e.color.red20:e.color.red};
              border-color: ${t?"transparent":n?e.color.red:e.background.transparent.light};
              border-width: ${!t&&n?"1px 1px !important":0};
              box-shadow: ${!t&&n?`0 0 0 3px ${e.color.red10}`:"none"};
              color: ${e.grayScale.gray0};
              &:hover {
                background: ${t?e.color.red20:e.color.red50};
              }
              &:active {
                background: ${t?e.color.red20:e.color.red50};
              }
            `}break;case"secondary":case"tertiary":switch(r){case"default":return `
              background: ${n?e.background.transparent.primary:"transparent"};
              border-color: ${o==="secondary"?!t&&n?e.color.blue:e.background.transparent.light:n?e.color.blue:"transparent"};
              border-width: ${!t&&n?"1px 1px !important":0};
              box-shadow: ${!t&&n?`0 0 0 3px ${e.accent.tertiary}`:"none"};
              color: ${t?e.font.color.extraLight:e.font.color.secondary};
              &:hover {
                background: ${t?"transparent":e.background.transparent.light};
              }
              &:active {
                background: ${t?"transparent":e.background.transparent.light};
              }
            `;case"blue":return `
              background: ${n?e.background.transparent.primary:"transparent"};
              border-color: ${o==="secondary"?n?e.color.blue:e.color.blue20:n?e.color.blue:"transparent"};
              border-width: ${!t&&n?"1px 1px !important":0};
              box-shadow: ${!t&&n?`0 0 0 3px ${e.accent.tertiary}`:"none"};
              color: ${t?e.accent.accent4060:e.color.blue};
              &:hover {
                background: ${t?"transparent":e.accent.tertiary};
              }
              &:active {
                background: ${t?"transparent":e.accent.secondary};
              }
            `;case"danger":return `
              background: ${t?"transparent":e.background.transparent.primary};
              border-color: ${o==="secondary"?n?e.color.red:e.border.color.danger:n?e.color.red:"transparent"};
              border-width: ${!t&&n?"1px 1px !important":0};
              box-shadow: ${!t&&n?`0 0 0 3px ${e.color.red10}`:"none"};
              color: ${t?e.color.red20:e.font.color.danger};
              &:hover {
                background: ${t?"transparent":e.background.danger};
              }
              &:active {
                background: ${t?"transparent":e.background.danger};
              }
            `}}}}

  border-radius: ${({position:e,theme:o})=>{switch(e){case"left":return `${o.border.radius.sm} 0px 0px ${o.border.radius.sm}`;case"right":return `0px ${o.border.radius.sm} ${o.border.radius.sm} 0px`;case"middle":return "0px";case"standalone":return o.border.radius.sm}}};
  border-style: solid;
  border-width: ${({variant:e,position:o})=>{switch(e){case"primary":case"secondary":return o==="middle"?"1px 0px":"1px";case"tertiary":return "0"}}};
  cursor: ${({disabled:e})=>e?"not-allowed":"pointer"};
  display: flex;
  flex-direction: row;
  font-family: ${({theme:e})=>e.font.family};
  font-weight: 500;
  gap: ${({theme:e})=>e.spacing(1)};
  height: ${({size:e})=>e==="small"?"24px":"32px"};
  padding: ${({theme:e})=>`0 ${e.spacing(2)}`};

  transition: background 0.1s ease;

  white-space: nowrap;

  width: ${({fullWidth:e})=>e?"100%":"auto"};

  &:focus {
    outline: none;
  }
`,Da=F__default.default(Tt)`
  margin-left: auto;
`,_=({className:e,Icon:o,title:r,fullWidth:t=!1,variant:n="primary",size:a="medium",accent:i="default",position:c="standalone",soon:s=!1,disabled:m=!1,focus:l=!1,onClick:u})=>{let g=react.useTheme();return jsxRuntime.jsxs(Aa,{fullWidth:t,variant:n,size:a,position:c,disabled:s||m,focus:l,accent:i,className:e,onClick:u,children:[o&&jsxRuntime.jsx(o,{size:g.icon.size.sm}),r,s&&jsxRuntime.jsx(Da,{})]})};var Na=F__default.default.div`
  border-radius: ${({theme:e})=>e.border.radius.md};
  display: flex;
`,fg=({className:e,children:o,variant:r,size:t,accent:n})=>jsxRuntime.jsx(Na,{className:e,children:ze__namespace.default.Children.map(o,(a,i)=>{if(!ze__namespace.default.isValidElement(a))return null;let c;i===0?c="left":i===o.length-1?c="right":c="middle";let s={position:c,variant:r,accent:n,size:t};return r&&(s.variant=r),n&&(s.variant=r),t&&(s.size=t),ze__namespace.default.cloneElement(a,s)})});var Wa=F__default.default.button`
  align-items: center;
  backdrop-filter: ${({applyBlur:e})=>e?"blur(20px)":"none"};
  background: ${({theme:e})=>e.background.primary};

  border: ${({focus:e,theme:o})=>e?`1px solid ${o.color.blue}`:"none"};
  border-radius: ${({theme:e})=>e.border.radius.sm};
  box-shadow: ${({theme:e,applyShadow:o,focus:r})=>o?`0px 2px 4px 0px ${e.background.transparent.light}, 0px 0px 4px 0px ${e.background.transparent.medium}${r?`,0 0 0 3px ${e.color.blue10}`:""}`:r?`0 0 0 3px ${e.color.blue10}`:"none"};
  color: ${({theme:e,disabled:o,focus:r})=>o?e.font.color.extraLight:r?e.color.blue:e.font.color.secondary};
  cursor: ${({disabled:e})=>e?"not-allowed":"pointer"};
  display: flex;

  flex-direction: row;
  font-family: ${({theme:e})=>e.font.family};
  font-weight: ${({theme:e})=>e.font.weight.regular};
  gap: ${({theme:e})=>e.spacing(1)};
  height: ${({size:e})=>e==="small"?"24px":"32px"};
  padding: ${({theme:e})=>`0 ${e.spacing(2)}`};
  transition: background 0.1s ease;

  white-space: nowrap;

  &:hover {
    background: ${({theme:e,disabled:o})=>o?"transparent":e.background.transparent.lighter};
  }

  &:active {
    background: ${({theme:e,disabled:o})=>o?"transparent":e.background.transparent.medium};
  }

  &:focus {
    outline: none;
  }
`,Sg=({className:e,Icon:o,title:r,size:t="small",applyBlur:n=!0,applyShadow:a=!0,disabled:i=!1,focus:c=!1})=>{let s=react.useTheme();return jsxRuntime.jsxs(Wa,{disabled:i,focus:c&&!i,size:t,applyBlur:n,applyShadow:a,className:e,children:[o&&jsxRuntime.jsx(o,{size:s.icon.size.sm}),r]})};var Ga=F__default.default.div`
  backdrop-filter: blur(20px);
  border-radius: ${({theme:e})=>e.border.radius.md};
  box-shadow: ${({theme:e})=>`0px 2px 4px 0px ${e.background.transparent.light}, 0px 0px 4px 0px ${e.background.transparent.medium}`};
  display: inline-flex;
`,$g=({children:e,size:o,className:r})=>jsxRuntime.jsx(Ga,{className:r,children:ze__namespace.default.Children.map(e,(t,n)=>{let a;n===0?a="left":n===e.length-1?a="right":a="middle";let i={position:a,size:o,applyShadow:!1,applyBlur:!1};return o&&(i.size=o),ze__namespace.default.cloneElement(t,i)})});var Ja=F__default.default.button`
  align-items: center;
  backdrop-filter: ${({applyBlur:e})=>e?"blur(20px)":"none"};
  background: ${({theme:e,isActive:o})=>o?e.background.transparent.medium:e.background.primary};
  border: ${({focus:e,theme:o})=>e?`1px solid ${o.color.blue}`:"transparent"};
  border-radius: ${({position:e,theme:o})=>{switch(e){case"left":return `${o.border.radius.sm} 0px 0px ${o.border.radius.sm}`;case"right":return `0px ${o.border.radius.sm} ${o.border.radius.sm} 0px`;case"middle":return "0px";case"standalone":return o.border.radius.sm}}};
  box-shadow: ${({theme:e,applyShadow:o,focus:r})=>o?`0px 2px 4px ${e.background.transparent.light}, 0px 0px 4px ${e.background.transparent.medium}${r?`,0 0 0 3px ${e.color.blue10}`:""}`:r?`0 0 0 3px ${e.color.blue10}`:"none"};
  box-sizing: border-box;
  color: ${({theme:e,disabled:o,focus:r})=>o?e.font.color.extraLight:r?e.color.blue:e.font.color.tertiary};
  cursor: ${({disabled:e})=>e?"not-allowed":"pointer"};
  display: flex;
  flex-direction: row;

  font-family: ${({theme:e})=>e.font.family};
  font-weight: ${({theme:e})=>e.font.weight.regular};
  gap: ${({theme:e})=>e.spacing(1)};
  justify-content: center;
  padding: 0;
  position: relative;
  transition: background ${({theme:e})=>e.animation.duration.instant}s
    ease;
  white-space: nowrap;

  ${({position:e,size:o})=>{let r=(o==="small"?24:32)-(e==="standalone"?0:4);return `
      height: ${r}px;
      width: ${r}px;
    `}}

  &:hover {
    background: ${({theme:e,isActive:o})=>!!o};
  }

  &:active {
    background: ${({theme:e,disabled:o})=>o?"transparent":e.background.transparent.medium};
  }

  &:focus {
    outline: none;
  }
`,Ut=({className:e,Icon:o,size:r="small",position:t="standalone",applyShadow:n=!0,applyBlur:a=!0,disabled:i=!1,focus:c=!1,onClick:s,isActive:m})=>{let l=react.useTheme();return jsxRuntime.jsx(Ja,{disabled:i,focus:c&&!i,size:r,applyShadow:n,applyBlur:a,className:e,position:t,onClick:s,isActive:m,children:o&&jsxRuntime.jsx(o,{size:l.icon.size.md})})};var ja=F__default.default.div`
  backdrop-filter: blur(20px);
  background-color: ${({theme:e})=>e.background.primary};
  border-radius: ${({theme:e})=>e.border.radius.sm};
  box-shadow: ${({theme:e})=>`0px 2px 4px 0px ${e.background.transparent.light}, 0px 0px 4px 0px ${e.background.transparent.medium}`};
  display: inline-flex;
  gap: 2px;
  padding: 2px;
`,se=({iconButtons:e,size:o,className:r})=>jsxRuntime.jsx(ja,{className:r,children:e.map(({Icon:t,onClick:n,isActive:a},i)=>{let c=e.length===1?"standalone":i===0?"left":i===e.length-1?"right":"middle";return jsxRuntime.jsx(Ut,{applyBlur:!1,applyShadow:!1,Icon:t,onClick:n,position:c,size:o,isActive:a},`floating-icon-button-${i}`)})});var ti=F__default.default.button`
  align-items: center;
  background: transparent;
  border: ${({theme:e,focus:o})=>o?`1px solid ${e.color.blue}`:"none"};

  border-radius: ${({theme:e})=>e.border.radius.sm};
  box-shadow: ${({theme:e,focus:o})=>o?`0 0 0 3px  ${e.color.blue10}`:"none"};
  color: ${({theme:e,accent:o,active:r,disabled:t,focus:n})=>{switch(o){case"secondary":return r||n?e.color.blue:t?e.font.color.extraLight:e.font.color.secondary;case"tertiary":return r||n?e.color.blue:t?e.font.color.extraLight:e.font.color.tertiary}}};
  cursor: ${({disabled:e})=>e?"not-allowed":"pointer"};
  display: flex;
  flex-direction: row;

  font-family: ${({theme:e})=>e.font.family};
  font-weight: ${({theme:e})=>e.font.weight.regular};
  gap: ${({theme:e})=>e.spacing(1)};
  height: 24px;
  padding: ${({theme:e})=>`0 ${e.spacing(2)}`};

  transition: background 0.1s ease;

  white-space: nowrap;

  &:hover {
    background: ${({theme:e,disabled:o})=>o?"transparent":e.background.transparent.light};
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: ${({theme:e,disabled:o})=>o?"transparent":e.background.transparent.medium};
  }
`,Ug=({className:e,Icon:o,title:r,active:t=!1,accent:n="secondary",disabled:a=!1,focus:i=!1,onClick:c})=>{let s=react.useTheme();return jsxRuntime.jsxs(ti,{onClick:c,disabled:a,focus:i&&!a,accent:n,className:e,active:t,children:[!!o&&jsxRuntime.jsx(o,{size:s.icon.size.sm}),r]})};var ci=F__default.default.button`
  align-items: center;
  background: transparent;
  border: none;

  border: ${({disabled:e,theme:o,focus:r})=>!e&&r?`1px solid ${o.color.blue}`:"none"};
  border-radius: ${({theme:e})=>e.border.radius.sm};
  box-shadow: ${({disabled:e,theme:o,focus:r})=>!e&&r?`0 0 0 3px ${o.color.blue10}`:"none"};
  color: ${({theme:e,accent:o,active:r,disabled:t,focus:n})=>{switch(o){case"secondary":return r||n?e.color.blue:t?e.font.color.extraLight:e.font.color.secondary;case"tertiary":return r||n?e.color.blue:t?e.font.color.extraLight:e.font.color.tertiary}}};
  cursor: ${({disabled:e})=>e?"not-allowed":"pointer"};
  display: flex;
  flex-direction: row;

  font-family: ${({theme:e})=>e.font.family};
  font-weight: ${({theme:e})=>e.font.weight.regular};
  gap: ${({theme:e})=>e.spacing(1)};
  height: ${({size:e})=>e==="small"?"24px":"32px"};
  justify-content: center;
  padding: 0;
  transition: background 0.1s ease;

  white-space: nowrap;

  width: ${({size:e})=>e==="small"?"24px":"32px"};

  &:hover {
    background: ${({theme:e,disabled:o})=>o?"transparent":e.background.transparent.light};
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: ${({theme:e,disabled:o})=>o?"transparent":e.background.transparent.medium};
  }
`,Wt=({"aria-label":e,className:o,testId:r,Icon:t,active:n=!1,size:a="small",accent:i="secondary",disabled:c=!1,focus:s=!1,onClick:m,title:l})=>{let u=react.useTheme();return jsxRuntime.jsx(ci,{"data-testid":r,"aria-label":e,onClick:m,disabled:c,focus:s&&!c,accent:i,className:o,size:a,active:n,title:l,children:t&&jsxRuntime.jsx(t,{size:u.icon.size.md,stroke:u.icon.stroke.sm})})};var pi=F__default.default.button`
  align-items: center;
  background: ${({theme:e,variant:o,disabled:r})=>{if(r)return e.background.secondary;switch(o){case"primary":return e.background.radialGradient;case"secondary":return e.background.primary;default:return e.background.primary}}};
  border: 1px solid;
  border-color: ${({theme:e,disabled:o,variant:r})=>{if(o)return e.background.transparent.lighter;switch(r){case"primary":return e.background.transparent.light;case"secondary":return e.border.color.medium;default:return e.background.primary}}};
  border-radius: ${({theme:e})=>e.border.radius.md};
  ${({theme:e,disabled:o})=>o?"":`box-shadow: ${e.boxShadow.light};`}
  color: ${({theme:e,variant:o,disabled:r})=>{if(r)return e.font.color.light;switch(o){case"primary":return e.grayScale.gray0;case"secondary":return e.font.color.primary;default:return e.font.color.primary}}};
  cursor: ${({disabled:e})=>e?"not-allowed":"pointer"};
  display: flex;
  flex-direction: row;
  font-family: ${({theme:e})=>e.font.family};
  font-weight: ${({theme:e})=>e.font.weight.semiBold};
  gap: ${({theme:e})=>e.spacing(2)};
  justify-content: center;
  outline: none;
  padding: ${({theme:e})=>e.spacing(2)} ${({theme:e})=>e.spacing(3)};
  width: ${({fullWidth:e})=>e?"100%":"auto"};
  ${({theme:e,variant:o})=>{switch(o){case"secondary":return `
          &:hover {
            background: ${e.background.tertiary};
          }
        `;default:return `
          &:hover {
            background: ${e.background.radialGradientHover}};
          }
        `}}};
`,Kg=({Icon:e,title:o,fullWidth:r=!1,variant:t="primary",type:n,onClick:a,disabled:i,className:c})=>{let s=react.useTheme();return jsxRuntime.jsxs(pi,{className:c,disabled:i,fullWidth:r,onClick:a,type:n,variant:t,children:[e&&jsxRuntime.jsx(e,{size:s.icon.size.sm}),o]})};var fi=F__default.default.button`
  align-items: center;
  background: ${({theme:e})=>e.color.blue};
  border: none;

  border-radius: 50%;
  color: ${({theme:e})=>e.font.color.inverted};

  cursor: pointer;
  display: flex;
  height: 20px;

  justify-content: center;

  outline: none;
  padding: 0;
  transition:
    color 0.1s ease-in-out,
    background 0.1s ease-in-out;

  &:disabled {
    background: ${({theme:e})=>e.background.quaternary};
    color: ${({theme:e})=>e.font.color.tertiary};
    cursor: default;
  }
  width: 20px;
`,Xt=({Icon:e,onClick:o,disabled:r,className:t})=>{let n=react.useTheme();return jsxRuntime.jsx(fi,{className:t,disabled:r,onClick:o,children:jsxRuntime.jsx(e,{size:n.icon.size.md})})};var bi=F__default.default.div`
  align-items: flex-end;
  background: ${({variant:e,theme:o})=>{switch(e){case"Dark":return o.grayScale.gray75;case"Light":default:return o.grayScale.gray15}}};
  border: ${({variant:e,theme:o})=>{switch(e){case"Dark":return `1px solid ${o.grayScale.gray70};`;case"Light":default:return `1px solid ${o.grayScale.gray20};`}}};
  border-radius: ${({theme:e})=>e.border.radius.md};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 80px;
  justify-content: flex-end;
  overflow: hidden;
  padding-left: ${({theme:e})=>e.spacing(6)};
  padding-top: ${({theme:e})=>e.spacing(6)};
  width: 120px;
`,hi=F__default.default(framerMotion.motion.div)`
  background: ${({theme:e,variant:o})=>{switch(o){case"Dark":return e.grayScale.gray75;case"Light":return e.grayScale.gray0}}};

  border-left: ${({variant:e,theme:o})=>{switch(e){case"Dark":return `1px solid ${o.grayScale.gray60};`;case"Light":default:return `1px solid ${o.grayScale.gray20};`}}};
  border-radius: ${({theme:e})=>e.border.radius.md} 0px 0px 0px;
  border-top: ${({variant:e,theme:o})=>{switch(e){case"Dark":return `1px solid ${o.grayScale.gray60};`;case"Light":default:return `1px solid ${o.grayScale.gray20};`}}};
  box-sizing: border-box;
  color: ${({variant:e,theme:o})=>{switch(e){case"Dark":return o.grayScale.gray30;case"Light":default:return o.grayScale.gray60}}};
  display: flex;
  flex: 1;
  font-size: 20px;
  height: 56px;
  padding-left: ${({theme:e})=>e.spacing(2)};
  padding-top: ${({theme:e})=>e.spacing(2)};
`,qe=({variant:e,controls:o,style:r,className:t,onClick:n,onMouseEnter:a,onMouseLeave:i})=>jsxRuntime.jsx(bi,{className:t,variant:e,style:r,onClick:n,onMouseEnter:a,onMouseLeave:i,children:jsxRuntime.jsx(hi,{animate:o,variant:e,children:"Aa"})}),Gt=F__default.default.div`
  position: relative;
  width: 120px;
`,xi=F__default.default.div`
  border-radius: ${({theme:e})=>e.border.radius.md};
  cursor: pointer;
  display: flex;
  height: 80px;
  overflow: hidden;
  position: relative;
  width: 120px;
`,qt=F__default.default(framerMotion.motion.div)`
  bottom: 0px;
  padding: ${({theme:e})=>e.spacing(2)};
  position: absolute;
  right: 0px;
`,Kt={initial:{opacity:0},animate:{opacity:1},exit:{opacity:0}},le=({variant:e,selected:o,onClick:r})=>{let t=framerMotion.useAnimation(),n=()=>{t.start({height:61,fontSize:"22px",transition:{duration:.1}});},a=()=>{t.start({height:56,fontSize:"20px",transition:{duration:.1}});};return e==="System"?jsxRuntime.jsxs(Gt,{children:[jsxRuntime.jsxs(xi,{onMouseEnter:n,onMouseLeave:a,onClick:r,children:[jsxRuntime.jsx(qe,{style:{borderTopRightRadius:0,borderBottomRightRadius:0},controls:t,variant:"Light"}),jsxRuntime.jsx(qe,{style:{borderTopLeftRadius:0,borderBottomLeftRadius:0},controls:t,variant:"Dark"})]}),jsxRuntime.jsx(framerMotion.AnimatePresence,{children:o&&jsxRuntime.jsx(qt,{variants:Kt,initial:"initial",animate:"animate",exit:"exit",transition:{duration:.3},children:jsxRuntime.jsx(Oe,{})},"system")})]}):jsxRuntime.jsxs(Gt,{children:[jsxRuntime.jsx(qe,{onMouseEnter:n,onMouseLeave:a,controls:t,variant:e,onClick:r}),jsxRuntime.jsx(framerMotion.AnimatePresence,{children:o&&jsxRuntime.jsx(qt,{variants:Kt,initial:"initial",animate:"animate",exit:"exit",transition:{duration:.3},children:jsxRuntime.jsx(Oe,{})},e)})]})};var Si=F__default.default.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({theme:e})=>e.spacing(4)};
  }
`,Qe=F__default.default.div`
  display: flex;
  flex-direction: column;
`,Je=F__default.default.span`
  color: ${({theme:e})=>e.font.color.secondary};
  font-size: ${({theme:e})=>e.font.size.xs};
  font-weight: ${({theme:e})=>e.font.weight.medium};
  margin-top: ${({theme:e})=>e.spacing(2)};
`,df=({value:e,onChange:o,className:r})=>jsxRuntime.jsxs(Si,{className:r,children:[jsxRuntime.jsxs(Qe,{children:[jsxRuntime.jsx(le,{onClick:()=>o("Light"),variant:"Light",selected:e==="Light"}),jsxRuntime.jsx(Je,{children:"Light"})]}),jsxRuntime.jsxs(Qe,{children:[jsxRuntime.jsx(le,{onClick:()=>o("Dark"),variant:"Dark",selected:e==="Dark"}),jsxRuntime.jsx(Je,{children:"Dark"})]}),jsxRuntime.jsxs(Qe,{children:[jsxRuntime.jsx(le,{onClick:()=>o("System"),variant:"System",selected:e==="System"}),jsxRuntime.jsx(Je,{children:"System settings"})]})]});var Jt=recoil.atom({key:"pendingHotkeyState",default:null});var je=(e,...o)=>{console.debug(e,o);};var de=recoil.atom({key:"internalHotkeysEnabledScopesState",default:[]});var jt=()=>recoil.useRecoilCallback(({snapshot:e})=>({callback:o,hotkeysEvent:r,keyboardEvent:t,scope:n,preventDefault:a=!0})=>{let i=e.getLoadable(de).valueOrThrow();if(!i.includes(n)){je(`%cI can't call hotkey (${r.keys}) because I'm in scope [${n}] and the active scopes are : [${i.join(", ")}]`,"color: gray; ");return}return je(`%cI can call hotkey (${r.keys}) because I'm in scope [${n}] and the active scopes are : [${i.join(", ")}]`,"color: green;"),a&&(t.stopPropagation(),t.preventDefault(),t.stopImmediatePropagation()),o(t,r)},[]);var C=(e,o,r,t,n={enableOnContentEditable:!0,enableOnFormTags:!0,preventDefault:!0})=>{let[a,i]=recoil.useRecoilState(Jt),c=jt();return reactHotkeysHook.useHotkeys(e,(s,m)=>{c({keyboardEvent:s,hotkeysEvent:m,callback:()=>{if(!a){o(s,m);return}i(null);},scope:r,preventDefault:!!n.preventDefault});},{enableOnContentEditable:n.enableOnContentEditable,enableOnFormTags:n.enableOnFormTags},t)};var oo=5,Ti=(t=>(t.Default="default",t.Icon="icon",t.Button="button",t))(Ti||{}),Pi=F__default.default.div`
  width: 100%;
`,Li=F__default.default.div`
  display: flex;
  position: relative;
  width: 100%;
`,Ri=F__default.default(wi__default.default)`
  background: ${({theme:e,variant:o})=>o==="button"?"transparent":e.background.tertiary};
  border: none;
  border-radius: 5px;
  color: ${({theme:e})=>e.font.color.primary};
  font-family: inherit;
  font-size: ${({theme:e})=>e.font.size.md};
  font-weight: ${({theme:e})=>e.font.weight.regular};
  line-height: 16px;
  overflow: auto;

  &:focus {
    border: none;
    outline: none;
  }

  &::placeholder {
    color: ${({theme:e})=>e.font.color.light};
    font-weight: ${({theme:e})=>e.font.weight.regular};
  }
  padding: ${({variant:e})=>e==="button"?"8px 0":"8px"};
  resize: none;
  width: 100%;
`,Bi=F__default.default.div`
  height: 0;
  position: relative;
  right: 26px;
  top: 6px;
  width: 0px;
`,Ei=F__default.default(_)`
  margin-left: ${({theme:e})=>e.spacing(2)};
`,Hi=F__default.default.div`
  color: ${({theme:e})=>e.font.color.light};
  font-weight: ${({theme:e})=>e.font.weight.medium};
  line-height: 150%;
  width: 100%;
`,Mi=F__default.default.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: ${({theme:e,isTextAreaHidden:o})=>o?0:e.spacing(4)};
`,Ai=F__default.default.div`
  cursor: text;
  padding-bottom: ${({theme:e})=>e.spacing(1)};
  padding-top: ${({theme:e})=>e.spacing(1)};
`,Ff=({placeholder:e,onValidate:o,minRows:r=1,onFocus:t,variant:n="default",buttonTitle:a,value:i="",className:c})=>{let[s,m]=ze.useState(!1),[l,u]=ze.useState(n==="button"),[g,x]=ze.useState(i),S=!g,b=g.split(/\s|\n/).filter(y=>y).length;C(["shift+enter","enter"],(y,A)=>{A.shift||!s||(y.preventDefault(),o?.(g),x(""));},"text-input",[o,g,x,s],{enableOnContentEditable:!0,enableOnFormTags:!0}),C("esc",y=>{s&&(y.preventDefault(),x(""));},"text-input",[o,x,s],{enableOnContentEditable:!0,enableOnFormTags:!0});let h=y=>{let A=y.currentTarget.value;x(A);},k=()=>{o?.(g),x("");},I=r>oo?oo:r;return jsxRuntime.jsx(jsxRuntime.Fragment,{children:jsxRuntime.jsxs(Pi,{className:c,children:[jsxRuntime.jsxs(Li,{children:[!l&&jsxRuntime.jsx(Ri,{autoFocus:n==="button",placeholder:e??"Write a comment",maxRows:oo,minRows:I,onChange:h,value:g,onFocus:()=>{t?.(),m(!0);},onBlur:()=>m(!1),variant:n}),n==="icon"&&jsxRuntime.jsx(Bi,{children:jsxRuntime.jsx(Xt,{onClick:k,Icon:iconsReact.IconArrowRight,disabled:S})})]}),n==="button"&&jsxRuntime.jsxs(Mi,{isTextAreaHidden:l,children:[jsxRuntime.jsx(Hi,{children:l?jsxRuntime.jsx(Ai,{onClick:()=>{u(!1),t?.();},children:"Write a comment"}):`${b} word${b===1?"":"s"}`}),jsxRuntime.jsx(Ei,{title:a??"Comment",disabled:S,onClick:k})]})]})})};var zi=(t=>(t.Primary="primary",t.Secondary="secondary",t.Tertiary="tertiary",t))(zi||{}),Ni=(r=>(r.Squared="squared",r.Rounded="rounded",r))(Ni||{}),Ui=(r=>(r.Large="large",r.Small="small",r))(Ui||{}),Oi=F__default.default.div`
  align-items: center;
  display: flex;
  position: relative;
`,Vi=F__default.default.input`
  cursor: pointer;
  margin: 0;
  opacity: 0;
  position: absolute;
  z-index: 10;

  & + label {
    --size: ${({checkboxSize:e})=>e==="large"?"18px":"12px"};
    cursor: pointer;
    height: calc(var(--size) + 2px);
    padding: 0;
    position: relative;
    width: calc(var(--size) + 2px);
  }

  & + label:before {
    --size: ${({checkboxSize:e})=>e==="large"?"18px":"12px"};
    background: ${({theme:e,indeterminate:o,isChecked:r})=>o||r?e.color.blue:"transparent"};
    border-color: ${({theme:e,indeterminate:o,isChecked:r,variant:t})=>{switch(!0){case(o||r):return e.color.blue;case t==="primary":return e.border.color.inverted;case t==="tertiary":return e.border.color.medium;default:return e.border.color.secondaryInverted}}};
    border-radius: ${({theme:e,shape:o})=>o==="rounded"?e.border.radius.rounded:e.border.radius.sm};
    border-style: solid;
    border-width: ${({variant:e})=>e==="tertiary"?"2px":"1px"};
    content: '';
    cursor: pointer;
    display: inline-block;
    height: var(--size);
    width: var(--size);
  }

  & + label > svg {
    --padding: ${({checkboxSize:e,variant:o})=>e==="large"||o==="tertiary"?"2px":"1px"};
    --size: ${({checkboxSize:e})=>e==="large"?"16px":"12px"};
    height: var(--size);
    left: var(--padding);
    position: absolute;
    stroke: ${({theme:e})=>e.grayScale.gray0};
    top: var(--padding);
    width: var(--size);
  }
`,ue=({checked:e,onChange:o,onCheckedChange:r,indeterminate:t,variant:n="primary",size:a="small",shape:i="squared",className:c})=>{let[s,m]=ze__namespace.useState(!1);ze__namespace.useEffect(()=>{m(e);},[e]);let l=g=>{o?.(g),r?.(g.target.checked),m(g.target.checked);},u="checkbox"+uuid.v4();return jsxRuntime.jsxs(Oi,{className:c,children:[jsxRuntime.jsx(Vi,{autoComplete:"off",type:"checkbox",id:u,name:"styled-checkbox","data-testid":"input-checkbox",checked:s,indeterminate:t,variant:n,checkboxSize:a,shape:i,isChecked:s,onChange:l}),jsxRuntime.jsx("label",{htmlFor:u,children:t?jsxRuntime.jsx(iconsReact.IconMinus,{}):s?jsxRuntime.jsx(iconsReact.IconCheck,{}):jsxRuntime.jsx(jsxRuntime.Fragment,{})})]})};var ge=e=>react.css`
  background-color: transparent;
  border: none;
  color: ${e.theme.font.color.primary};
  font-family: ${e.theme.font.family};
  font-size: inherit;
  font-weight: inherit;
  outline: none;
  padding: ${e.theme.spacing(0)} ${e.theme.spacing(2)};

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${e.theme.font.color.light};
    font-family: ${e.theme.font.family};
    font-weight: ${e.theme.font.weight.medium};
  }
`,tr=e=>react.css`
  transition: background 0.1s ease;
  &:hover {
    background: ${e.theme.background.transparent.light};
  }
`;var no=({refs:e,callback:o,mode:r="compareHTMLRef",enabled:t=!0})=>{let[n,a]=ze.useState(!1);ze.useEffect(()=>{let i=s=>{if(r==="compareHTMLRef"){let m=e.filter(l=>!!l.current).some(l=>l.current?.contains(s.target));a(m);}if(r==="comparePixels"){let m=e.filter(l=>!!l.current).some(l=>{if(!l.current)return !1;let{x:u,y:g,width:x,height:S}=l.current.getBoundingClientRect(),b="clientX"in s?s.clientX:s.changedTouches[0].clientX,h="clientY"in s?s.clientY:s.changedTouches[0].clientY;return !(b<u||b>u+x||h<g||h>g+S)});a(m);}},c=s=>{r==="compareHTMLRef"&&!e.filter(l=>!!l.current).some(l=>l.current?.contains(s.target))&&!n&&o(s),r==="comparePixels"&&!e.filter(l=>!!l.current).some(l=>{if(!l.current)return !1;let{x:u,y:g,width:x,height:S}=l.current.getBoundingClientRect(),b="clientX"in s?s.clientX:s.changedTouches[0].clientX,h="clientY"in s?s.clientY:s.changedTouches[0].clientY;return !(b<u||b>u+x||h<g||h>g+S)})&&!n&&o(s);};if(t)return document.addEventListener("mousedown",i,{capture:!0}),document.addEventListener("click",c,{capture:!0}),document.addEventListener("touchstart",i,{capture:!0}),document.addEventListener("touchend",c,{capture:!0}),()=>{document.removeEventListener("mousedown",i,{capture:!0}),document.removeEventListener("click",c,{capture:!0}),document.removeEventListener("touchstart",i,{capture:!0}),document.removeEventListener("touchend",c,{capture:!0});}},[e,o,r,t,n]);};var ao=e=>e!=null;var rr=F__default.default.input`
  margin: 0;
  ${ge}
  width: 100%;
`;var Zi=F__default.default.span`
  pointer-events: none;
  position: fixed;
  visibility: hidden;
`,io=({children:e,node:o=e(void 0)})=>{let r=ze.useRef(null),[t,n]=ze.useState(void 0);return ze.useLayoutEffect(()=>{if(!r.current)return;let a=new ResizeObserver(()=>{r.current&&n({width:r.current.offsetWidth,height:r.current.offsetHeight});});return a.observe(r.current),()=>a.disconnect()},[r]),jsxRuntime.jsxs(jsxRuntime.Fragment,{children:[jsxRuntime.jsx(Zi,{ref:r,children:o}),t&&e(t)]})};var nr={commandMenu:!0,goto:!1,keyboardShortcutMenu:!1},ar={scope:"app",customScopes:{commandMenu:!0,goto:!0,keyboardShortcutMenu:!0}};var ee=recoil.atom({key:"currentHotkeyScopeState",default:ar});var fe=recoil.atom({key:"previousHotkeyScopeState",default:null});var ir=(e,o)=>e?.commandMenu===o?.commandMenu&&e?.goto===o?.goto&&e?.keyboardShortcutMenu===o?.keyboardShortcutMenu,cr=()=>recoil.useRecoilCallback(({snapshot:e,set:o})=>async(r,t)=>{let n=e.getLoadable(ee).valueOrThrow();if(n.scope===r){if(ao(t)){if(ir(n?.customScopes,t))return}else if(ir(n?.customScopes,nr))return}let a={scope:r,customScopes:{commandMenu:t?.commandMenu??!0,goto:t?.goto??!1,keyboardShortcutMenu:t?.keyboardShortcutMenu??!1}},i=[];a.customScopes?.commandMenu&&i.push("command-menu"),a?.customScopes?.goto&&i.push("goto"),a?.customScopes?.keyboardShortcutMenu&&i.push("keyboard-shortcut-menu"),i.push(a.scope),o(de,i),o(ee,a);},[]);var B=()=>{let e=cr(),o=recoil.useRecoilCallback(({snapshot:t,set:n})=>()=>{let a=t.getLoadable(fe).valueOrThrow();a&&(e(a.scope,a.customScopes),n(fe,null));},[e]);return {setHotkeyScopeAndMemorizePreviousScope:recoil.useRecoilCallback(({snapshot:t,set:n})=>(a,i)=>{let c=t.getLoadable(ee).valueOrThrow();e(a,i),n(fe,c);},[e]),goBackToPreviousHotkeyScope:o}};var ic=F__default.default.div`
  align-items: center;
  display: flex;
  justify-content: center;
  text-align: center;
`,lr=F__default.default(rr)`
  margin: 0 ${({theme:e})=>e.spacing(.5)};
  padding: 0;
  width: ${({width:e})=>e?`${e}px`:"auto"};

  &:hover:not(:focus) {
    background-color: ${({theme:e})=>e.background.transparent.light};
    border-radius: ${({theme:e})=>e.border.radius.sm};
    cursor: pointer;
    padding: 0 ${({theme:e})=>e.spacing(1)};
  }
`,Wy=({firstValue:e,secondValue:o,firstValuePlaceholder:r,secondValuePlaceholder:t,onChange:n,className:a})=>{let{goBackToPreviousHotkeyScope:i,setHotkeyScopeAndMemorizePreviousScope:c}=B(),s=()=>{c("text-input");},m=()=>{i();};return jsxRuntime.jsxs(ic,{className:a,children:[jsxRuntime.jsx(io,{node:e||r,children:l=>jsxRuntime.jsx(lr,{width:l?.width,placeholder:r,value:e,onFocus:s,onBlur:m,onChange:u=>{n(u.target.value,o);}})}),jsxRuntime.jsx(io,{node:o||t,children:l=>jsxRuntime.jsx(lr,{width:l?.width,autoComplete:"off",placeholder:t,value:o,onFocus:s,onChange:u=>{n(e,u.target.value);}})})]})};var dr=recoil.atom({key:"iconsState",default:{}});var mr=()=>{let e=recoil.useRecoilValue(dr),o=iconsReact.Icon123;return {getIcons:()=>e,getIcon:n=>n?e[n]??o:o}};var ur=({hotkey:e,onHotkeyTriggered:o})=>(C(e.key,()=>o(),e.scope,[o]),jsxRuntime.jsx(jsxRuntime.Fragment,{}));var gr=e=>ze.useContext(e);var q=(e,o)=>{let t=gr(e)?.scopeId;if(o)return o;if(t)return t;throw new Error("Scope id is not provided and cannot be found in context.")};var be=e=>ze.createContext(e??null);var he=be();var xe=(e,o)=>recoil.useRecoilState(e({scopeId:o}));var $=({key:e,defaultValue:o})=>recoil.atomFamily({key:e,default:o});var fr=$({key:"dropdownHotkeyScopeScopedState",defaultValue:null});var yr=$({key:"dropdownWidthScopedState",defaultValue:160});var br=$({key:"isDropdownOpenScopedState",defaultValue:!1});var hr=({scopeId:e})=>{let[o,r]=xe(br,e),[t,n]=xe(fr,e),[a,i]=xe(yr,e);return {isDropdownOpen:o,setIsDropdownOpen:r,dropdownHotkeyScope:t,setDropdownHotkeyScope:n,dropdownWidth:a,setDropdownWidth:i}};var E=e=>{let{setHotkeyScopeAndMemorizePreviousScope:o,goBackToPreviousHotkeyScope:r}=B(),t=q(he,e?.dropdownScopeId),{dropdownHotkeyScope:n,setDropdownHotkeyScope:a,isDropdownOpen:i,setIsDropdownOpen:c,dropdownWidth:s,setDropdownWidth:m}=hr({scopeId:t}),l=()=>{r(),c(!1);},u=()=>{c(!0),n&&o(n.scope,n.customScopes);};return {scopeId:t,isDropdownOpen:i,closeDropdown:l,toggleDropdown:()=>{i?l():u();},openDropdown:u,dropdownHotkeyScope:n,setDropdownHotkeyScope:a,dropdownWidth:s,setDropdownWidth:m}};var xr=(e,o)=>yc__default.default(e,o);var Sr=({dropdownHotkeyScopeFromParent:e})=>{let{dropdownHotkeyScope:o,setDropdownHotkeyScope:r}=E();ze.useEffect(()=>{xr(e,o)||r(e);},[o,e,r]);};var xc=F__default.default.div`
  backdrop-filter: ${({disableBlur:e})=>e?"none":"blur(20px)"};
  background: ${({theme:e})=>e.background.secondary};
  border: 1px solid ${({theme:e})=>e.border.color.medium};
  border-radius: ${({theme:e})=>e.border.radius.md};

  box-shadow: ${({theme:e})=>e.boxShadow.strong};

  display: flex;

  flex-direction: column;

  width: ${({width:e})=>e?`${typeof e=="number"?`${e}px`:e}`:"160px"};
`,Se=xc;var Ir=({onDropdownClose:e,onDropdownOpen:o})=>{let{isDropdownOpen:r}=E();return ze.useEffect(()=>{r?o?.():e?.();},[r,e,o]),null};var ke=({className:e,clickableComponent:o,dropdownComponents:r,dropdownMenuWidth:t,hotkey:n,dropdownHotkeyScope:a,dropdownPlacement:i="bottom-end",dropdownOffset:c={x:0,y:0},onClickOutside:s,onClose:m,onOpen:l})=>{let u=ze.useRef(null),{isDropdownOpen:g,toggleDropdown:x,closeDropdown:S,dropdownWidth:b}=E(),h=[];c.x&&h.push(react$2.offset({crossAxis:c.x})),c.y&&h.push(react$2.offset({mainAxis:c.y}));let{refs:k,floatingStyles:I}=react$2.useFloating({placement:i,middleware:[react$2.flip(),...h],whileElementsMounted:react$2.autoUpdate}),y=()=>{x();};return no({refs:[u],callback:()=>{s?.(),g&&S();}}),Sr({dropdownHotkeyScopeFromParent:a}),C(tsKeyEnum.Key.Escape,()=>{S();},a.scope,[S]),jsxRuntime.jsxs("div",{ref:u,className:e,children:[o&&jsxRuntime.jsx("div",{ref:k.setReference,onClick:x,children:o}),n&&jsxRuntime.jsx(ur,{hotkey:n,onHotkeyTriggered:y}),g&&jsxRuntime.jsx(Se,{width:t??b,"data-select-disable":!0,ref:k.setFloating,style:I,children:r}),jsxRuntime.jsx(Ir,{onDropdownClose:m,onDropdownOpen:l})]})};var Ce=recoil.atom({key:"scroll/isScollingState",default:!1});var Cr=({scrollableRef:e})=>{let o=recoil.useRecoilCallback(({snapshot:n})=>()=>{n.getLoadable(Ce).getValue()||e.current?.classList.remove("scrolling");}),r=recoil.useRecoilCallback(({set:n})=>()=>{n(Ce,!0),e.current?.classList.add("scrolling");}),t=recoil.useRecoilCallback(({set:n})=>()=>{n(Ce,!1),Lc__default.default(o,1e3)();});ze.useEffect(()=>{let n=e.current;return n?.addEventListener("scrollend",t),n?.addEventListener("scroll",r),()=>{n?.removeEventListener("scrollend",t),n?.removeEventListener("scroll",r);}},[o,r,t,e]);};var Hc=ze.createContext({current:null}),Mc=F__default.default.div`
  display: flex;
  height: 100%;
  overflow: auto;
  scrollbar-gutter: stable;
  width: 100%;

  &.scrolling::-webkit-scrollbar-thumb {
    background-color: ${({theme:e})=>e.border.color.medium};
  }
`,$r=({children:e,className:o})=>{let r=ze.useRef(null);return Cr({scrollableRef:r}),jsxRuntime.jsx(Hc.Provider,{value:r,children:jsxRuntime.jsx(Mc,{ref:r,className:o,children:e})})};var Ac=F__default.default.div`
  --padding: ${({theme:e})=>e.spacing(1)};

  align-items: flex-start;
  display: flex;

  flex-direction: column;
  gap: 2px;
  height: 100%;
  max-height: ${({hasMaxHeight:e})=>e?"180px":"none"};
  overflow-y: auto;

  padding: var(--padding);
  padding-right: 0;

  width: calc(100% - 1 * var(--padding));
`,Dc=F__default.default($r)`
  width: 100%;
`,Fc=F__default.default.div`
  align-items: flex-start;
  display: flex;

  flex-direction: column;
  gap: 2px;
  height: 100%;
  width: 100%;
`,ve=({children:e,hasMaxHeight:o})=>jsxRuntime.jsx(Ac,{hasMaxHeight:o,children:jsxRuntime.jsx(Dc,{children:jsxRuntime.jsx(Fc,{children:e})})});var Nc=F__default.default.div`
  --vertical-padding: ${({theme:e})=>e.spacing(1)};

  align-items: center;

  display: flex;
  flex-direction: row;
  height: calc(36px - 2 * var(--vertical-padding));
  padding: var(--vertical-padding) 0;

  width: 100%;
`,Uc=F__default.default.input`
  ${ge}

  font-size: ${({theme:e})=>e.font.size.sm};
  width: 100%;

  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
`,Pr=ze.forwardRef(({value:e,onChange:o,autoFocus:r,placeholder:t="Search",type:n},a)=>jsxRuntime.jsx(Nc,{children:jsxRuntime.jsx(Uc,{autoComplete:"off",autoFocus:r,onChange:o,placeholder:t,type:n,value:e,ref:a})}));var Vc=F__default.default.div`
  background-color: ${({theme:e})=>e.border.color.light};
  height: 1px;

  width: 100%;
`,Lr=Vc;var $e=({children:e,dropdownScopeId:o})=>jsxRuntime.jsx(he.Provider,{value:{scopeId:o},children:e});var Rr=$({key:"selectableItemIdsScopedState",defaultValue:[[]]});var Br=$({key:"selectableListOnEnterScopedState",defaultValue:void 0});var Er=$({key:"selectedItemIdScopedState",defaultValue:null});var Hr=({key:e,defaultValue:o})=>recoil.atomFamily({key:e,default:o});var po=Hr({key:"isSelectedItemIdMapScopedFamilyState",defaultValue:!1});var Mr=recoil.selectorFamily({key:"isSelectedItemIdScopedFamilySelector",get:({scopeId:e,itemId:o})=>({get:r})=>r(po({scopeId:e,familyKey:o})),set:({scopeId:e,itemId:o})=>({set:r},t)=>r(po({scopeId:e,familyKey:o}),t)});var we=(e,o)=>e({scopeId:o});var _c="UNDEFINED_SELECTABLE_ITEM_ID",O=({selectableListScopeId:e,itemId:o})=>{let r=Mr({scopeId:e,itemId:o??_c}),t=we(Er,e),n=we(Rr,e),a=we(Br,e);return {isSelectedItemIdSelector:r,selectableItemIdsState:n,selectedItemIdState:t,selectableListOnEnterState:a}};var oe=(e,o)=>e.getLoadable(o).getValue();var Dr=(e,o)=>{let r=(n,a)=>{if(a)for(let i=0;i<n.length;i++){let c=n[i].indexOf(a);if(c!==-1)return {row:i,col:c}}},t=recoil.useRecoilCallback(({snapshot:n,set:a})=>i=>{let{selectedItemIdState:c,selectableItemIdsState:s}=O({selectableListScopeId:e}),m=oe(n,c),l=oe(n,s),u=r(l,m),x=(S=>{if(!m||!u)return l[0][0];let{row:b,col:h}=u;if(l.length===0)return;let k=l.length===1,I,y;switch(S){case"up":I=k?b:Math.max(0,b-1),y=k?Math.max(0,h-1):h;break;case"down":I=k?b:Math.min(l.length-1,b+1),y=k?Math.min(l[b].length-1,h+1):h;break;case"left":I=b,y=Math.max(0,h-1);break;case"right":I=b,y=Math.min(l[b].length-1,h+1);break;default:I=b,y=h;}return l[I][y]})(i);if(m!==x){if(x){let{isSelectedItemIdSelector:S}=O({selectableListScopeId:e,itemId:x});a(S,!0),a(c,x);}if(m){let{isSelectedItemIdSelector:S}=O({selectableListScopeId:e,itemId:m});a(S,!1);}}},[e]);return C(tsKeyEnum.Key.ArrowUp,()=>t("up"),o,[]),C(tsKeyEnum.Key.ArrowDown,()=>t("down"),o,[]),C(tsKeyEnum.Key.ArrowLeft,()=>t("left"),o,[]),C(tsKeyEnum.Key.ArrowRight,()=>t("right"),o,[]),C(tsKeyEnum.Key.Enter,recoil.useRecoilCallback(({snapshot:n})=>()=>{let{selectedItemIdState:a,selectableListOnEnterState:i}=O({selectableListScopeId:e}),c=oe(n,a),s=oe(n,i);c&&s?.(c);},[e]),o,[]),jsxRuntime.jsx(jsxRuntime.Fragment,{})};var K=be();var Fr=e=>{let{selectableListScopeId:o,itemId:r}=e??{},t=q(K,o),{selectedItemIdState:n,selectableItemIdsState:a,isSelectedItemIdSelector:i,selectableListOnEnterState:c}=O({selectableListScopeId:t,itemId:r});return {scopeId:t,isSelectedItemIdSelector:i,selectableItemIdsState:a,selectedItemIdState:n,selectableListOnEnterState:c}};var Te=e=>{let o=q(K,e?.selectableListId),{selectableItemIdsState:r,isSelectedItemIdSelector:t,selectableListOnEnterState:n}=Fr({selectableListScopeId:o,itemId:e?.itemId}),a=recoil.useSetRecoilState(r),i=recoil.useSetRecoilState(n),c=recoil.useRecoilValue(t);return {setSelectableItemIds:a,isSelectedItemId:c,setSelectableListOnEnter:i,selectableListId:o,isSelectedItemIdSelector:t}};var Nr=({children:e,selectableListScopeId:o})=>jsxRuntime.jsx(K.Provider,{value:{scopeId:o},children:e});var Pe=(e,o)=>{let r=[...e],t=[];for(;r.length;)t.push(r.splice(0,o));return t};var Or=({children:e,selectableListId:o,hotkeyScope:r,selectableItemIdArray:t,selectableItemIdMatrix:n,onEnter:a})=>{Dr(o,r);let{setSelectableItemIds:i,setSelectableListOnEnter:c}=Te({selectableListId:o});return ze.useEffect(()=>{c(()=>a);},[a,c]),ze.useEffect(()=>{if(!t&&!n)throw new Error("Either selectableItemIdArray or selectableItemIdsMatrix must be provided");n&&i(n),t&&i(Pe(t,1));},[t,n,i]),jsxRuntime.jsx(Nr,{selectableListScopeId:o,children:e})};var es=F__default.default.button`
  align-items: center;
  ${({theme:e,variant:o,accent:r,disabled:t,focus:n})=>{switch(o){case"primary":switch(r){case"default":return `
              background: ${e.background.secondary};
              border-color: ${t?"transparent":n?e.color.blue:e.background.transparent.light};
              color: ${t?e.font.color.extraLight:e.font.color.secondary};
              border-width: ${!t&&n?"1px 1px !important":0};
              box-shadow: ${!t&&n?`0 0 0 3px ${e.accent.tertiary}`:"none"};
              &:hover {
                background: ${t?e.background.secondary:e.background.tertiary};
              }
              &:active {
                background: ${t?e.background.secondary:e.background.quaternary};
              }
            `;case"blue":return `
              background: ${t?e.color.blue20:e.color.blue};
              border-color: ${t?"transparent":n?e.color.blue:e.background.transparent.light};
              border-width: ${!t&&n?"1px 1px !important":0};
              color: ${e.grayScale.gray0};
              box-shadow: ${!t&&n?`0 0 0 3px ${e.accent.tertiary}`:"none"};
              &:hover {
                background: ${t?e.color.blue20:e.color.blue50};
              }
              &:active {
                background: ${t?e.color.blue20:e.color.blue60};
              }
            `;case"danger":return `
              background: ${t?e.color.red20:e.color.red};
              border-color: ${t?"transparent":n?e.color.red:e.background.transparent.light};
              border-width: ${!t&&n?"1px 1px !important":0};
              box-shadow: ${!t&&n?`0 0 0 3px ${e.color.red10}`:"none"};
              color: ${e.grayScale.gray0};
              &:hover {
                background: ${t?e.color.red20:e.color.red50};
              }
              &:active {
                background: ${t?e.color.red20:e.color.red50};
              }
            `}break;case"secondary":case"tertiary":switch(r){case"default":return `
              background: ${n?e.background.transparent.primary:"transparent"};
              border-color: ${o==="secondary"?!t&&n?e.color.blue:e.background.transparent.light:n?e.color.blue:"transparent"};
              border-width: ${!t&&n?"1px 1px !important":0};
              box-shadow: ${!t&&n?`0 0 0 3px ${e.accent.tertiary}`:"none"};
              color: ${t?e.font.color.extraLight:e.font.color.secondary};
              &:hover {
                background: ${t?"transparent":e.background.transparent.light};
              }
              &:active {
                background: ${t?"transparent":e.background.transparent.light};
              }
            `;case"blue":return `
              background: ${n?e.background.transparent.primary:"transparent"};
              border-color: ${o==="secondary"?t?e.color.blue20:e.color.blue:n?e.color.blue:"transparent"};
              border-width: ${!t&&n?"1px 1px !important":0};
              box-shadow: ${!t&&n?`0 0 0 3px ${e.accent.tertiary}`:"none"};
              color: ${t?e.accent.accent4060:e.color.blue};
              &:hover {
                background: ${t?"transparent":e.accent.tertiary};
              }
              &:active {
                background: ${t?"transparent":e.accent.secondary};
              }
            `;case"danger":return `
              background: transparent;
              border-color: ${o==="secondary"?e.border.color.danger:n?e.color.red:"transparent"};
              border-width: ${!t&&n?"1px 1px !important":0};
              box-shadow: ${!t&&n?`0 0 0 3px ${e.color.red10}`:"none"};
              color: ${t?e.color.red20:e.font.color.danger};
              &:hover {
                background: ${t?"transparent":e.background.danger};
              }
              &:active {
                background: ${t?"transparent":e.background.danger};
              }
            `}}}}

  border-radius: ${({position:e,theme:o})=>{switch(e){case"left":return `${o.border.radius.sm} 0px 0px ${o.border.radius.sm}`;case"right":return `0px ${o.border.radius.sm} ${o.border.radius.sm} 0px`;case"middle":return "0px";case"standalone":return o.border.radius.sm}}};
  border-style: solid;
  border-width: ${({variant:e,position:o})=>{switch(e){case"primary":case"secondary":return o==="middle"?"1px 0px":"1px";case"tertiary":return "0"}}};
  box-sizing: content-box;
  cursor: ${({disabled:e})=>e?"not-allowed":"pointer"};
  display: flex;
  flex-direction: row;
  font-family: ${({theme:e})=>e.font.family};
  font-weight: 500;
  gap: ${({theme:e})=>e.spacing(1)};
  height: ${({size:e})=>e==="small"?"24px":"32px"};
  justify-content: center;
  padding: 0;
  transition: background 0.1s ease;

  white-space: nowrap;

  width: ${({size:e})=>e==="small"?"24px":"32px"};

  &:focus {
    outline: none;
  }
`,Wr=({className:e,Icon:o,variant:r="primary",size:t="medium",accent:n="default",position:a="standalone",disabled:i=!1,focus:c=!1,dataTestId:s,ariaLabel:m,onClick:l})=>{let u=react.useTheme();return jsxRuntime.jsx(es,{"data-testid":s,variant:r,size:t,position:a,disabled:i,focus:c,accent:n,className:e,onClick:l,"aria-label":m,children:o&&jsxRuntime.jsx(o,{size:u.icon.size.md})})};var ts=F__default.default.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({theme:e})=>e.spacing(.5)};
`,rs=F__default.default(Wt)`
  background: ${({theme:e,isSelected:o})=>o?e.background.transparent.medium:"transparent"};
`,_r=e=>e.replace(/[A-Z]/g,o=>` ${o}`).trim(),ns=({iconKey:e,onClick:o,selectedIconKey:r,Icon:t})=>{let{isSelectedItemId:n}=Te({itemId:e});return jsxRuntime.jsx(rs,{"aria-label":_r(e),size:"medium",title:e,isSelected:e===r||n,Icon:t,onClick:o},e)},Zx=({disabled:e,dropdownScopeId:o="icon-picker",onChange:r,selectedIconKey:t,onClickOutside:n,onClose:a,onOpen:i,variant:c="secondary",className:s})=>{let[m,l]=ze.useState(""),{goBackToPreviousHotkeyScope:u,setHotkeyScopeAndMemorizePreviousScope:g}=B(),{closeDropdown:x}=E({dropdownScopeId:o}),{getIcons:S,getIcon:b}=mr(),h=S(),k=ze.useMemo(()=>{let y=h?Object.keys(h).filter(A=>A!==t&&(!m||[A,_r(A)].some(Ne=>Ne.toLowerCase().includes(m.toLowerCase())))):[];return (t?[t,...y]:y).slice(0,25)},[h,m,t]),I=ze.useMemo(()=>Pe(k.slice(),5),[k]);return jsxRuntime.jsx($e,{dropdownScopeId:o,children:jsxRuntime.jsx("div",{className:s,children:jsxRuntime.jsx(ke,{dropdownHotkeyScope:{scope:"icon-picker"},clickableComponent:jsxRuntime.jsx(Wr,{disabled:e,Icon:t?b(t):iconsReact.IconApps,variant:c}),dropdownMenuWidth:176,dropdownComponents:jsxRuntime.jsx(Or,{selectableListId:"icon-list",selectableItemIdMatrix:I,hotkeyScope:"icon-picker",onEnter:y=>{r({iconKey:y,Icon:b(y)}),x();},children:jsxRuntime.jsxs(Se,{width:176,children:[jsxRuntime.jsx(Pr,{placeholder:"Search icon",autoFocus:!0,onChange:y=>l(y.target.value)}),jsxRuntime.jsx(Lr,{}),jsxRuntime.jsx("div",{onMouseEnter:()=>{g("icon-picker");},onMouseLeave:u,children:jsxRuntime.jsx(ve,{children:jsxRuntime.jsx(ts,{children:k.map(y=>jsxRuntime.jsx(ns,{iconKey:y,onClick:()=>{r({iconKey:y,Icon:b(y)}),x();},selectedIconKey:t,Icon:b(y)},y))})})})]})}),onClickOutside:n,onClose:()=>{a?.(),l("");},onOpen:i})})})};var ss=F__default.default.div`
  display: flex;
  flex-direction: row;
`,ls=F__default.default.button`
  align-items: center;
  background: ${({theme:e,disabled:o})=>o?e.background.secondary:e.background.tertiary};
  border: none;
  border-radius: ${({theme:e})=>e.border.radius.sm};
  color: ${({theme:e})=>e.font.color.light};
  cursor: ${({disabled:e})=>e?"not-allowed":"pointer"};
  display: flex;
  height: 66px;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  transition: background 0.1s ease;

  width: 66px;

  img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  ${({theme:e,withPicture:o,disabled:r})=>o||r?"":`
      &:hover {
        background: ${e.background.quaternary};
      }
    `};
`,ps=F__default.default.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  margin-left: ${({theme:e})=>e.spacing(4)};
`,ds=F__default.default.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({theme:e})=>e.spacing(2)};
  }
`,ms=F__default.default.span`
  color: ${({theme:e})=>e.font.color.light};
  font-size: ${({theme:e})=>e.font.size.xs};
`,us=F__default.default.span`
  color: ${({theme:e})=>e.font.color.danger};
  font-size: ${({theme:e})=>e.font.size.xs};
  margin-top: ${({theme:e})=>e.spacing(1)};
`,gs=F__default.default.input`
  display: none;
`,i0=({picture:e,onUpload:o,onRemove:r,onAbort:t,isUploading:n=!1,errorMessage:a,disabled:i=!1,className:c})=>{let s=react.useTheme(),m=ze__namespace.default.useRef(null),l=()=>{m.current?.click();};return jsxRuntime.jsxs(ss,{className:c,children:[jsxRuntime.jsx(ls,{withPicture:!!e,disabled:i,onClick:l,children:e?jsxRuntime.jsx("img",{src:e||"/images/default-profile-picture.png",alt:"profile"}):jsxRuntime.jsx(iconsReact.IconFileUpload,{size:s.icon.size.md})}),jsxRuntime.jsxs(ps,{children:[jsxRuntime.jsxs(ds,{children:[jsxRuntime.jsx(gs,{type:"file",ref:m,accept:"image/jpeg, image/png, image/gif",onChange:u=>{o&&u.target.files&&o(u.target.files[0]);}}),n&&t?jsxRuntime.jsx(_,{Icon:iconsReact.IconX,onClick:t,variant:"secondary",title:"Abort",disabled:!e||i,fullWidth:!0}):jsxRuntime.jsx(_,{Icon:iconsReact.IconUpload,onClick:l,variant:"secondary",title:"Upload",disabled:i,fullWidth:!0}),jsxRuntime.jsx(_,{Icon:iconsReact.IconTrash,onClick:r,variant:"secondary",title:"Remove",disabled:!e||i,fullWidth:!0})]}),jsxRuntime.jsx(ms,{children:"We support your best PNGs, JPEGs and GIFs portraits under 10MB"}),a&&jsxRuntime.jsx(us,{children:a})]})]})};var Gr=({value:e,onChange:o,onValueChange:r,children:t})=>{let n=react.useTheme(),a=i=>{o?.(i),r?.(i.target.value);};return jsxRuntime.jsx(jsxRuntime.Fragment,{children:ze__namespace.default.Children.map(t,i=>ze__namespace.default.isValidElement(i)?ze__namespace.default.cloneElement(i,{style:{marginBottom:n.spacing(2)},checked:i.props.value===e,onChange:a}):i)})};var xs=(r=>(r.Large="large",r.Small="small",r))(xs||{}),Ss=(r=>(r.Left="left",r.Right="right",r))(Ss||{}),Is=F__default.default.div`
  ${({labelPosition:e})=>e==="left"?`
    flex-direction: row-reverse;
  `:`
    flex-direction: row;
  `};
  align-items: center;
  display: inline-flex;
`,ks=F__default.default(framerMotion.motion.input)`
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  border: 1px solid ${({theme:e})=>e.font.color.secondary};
  border-radius: 50%;
  :hover {
    background-color: ${({theme:e,checked:o})=>{if(!o)return e.background.tertiary}};
    outline: 4px solid
      ${({theme:e,checked:o})=>o?f(e.color.blue,.12):e.background.tertiary};
  }
  &:checked {
    background-color: ${({theme:e})=>e.color.blue};
    border: none;
    &::after {
      background-color: ${({theme:e})=>e.grayScale.gray0};
      border-radius: 50%;
      content: '';
      height: ${({"radio-size":e})=>e==="large"?"8px":"6px"};
      left: 50%;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: ${({"radio-size":e})=>e==="large"?"8px":"6px"};
    }
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.12;
  }
  height: ${({"radio-size":e})=>e==="large"?"18px":"16px"};
  position: relative;
  width: ${({"radio-size":e})=>e==="large"?"18px":"16px"};
`,Cs=F__default.default.label`
  color: ${({theme:e})=>e.font.color.primary};
  cursor: pointer;
  font-size: ${({theme:e})=>e.font.size.sm};
  font-weight: ${({theme:e})=>e.font.weight.regular};
  margin-left: ${({theme:e,labelPosition:o})=>o==="right"?e.spacing(2):"0px"};
  margin-right: ${({theme:e,labelPosition:o})=>o==="left"?e.spacing(2):"0px"};
  opacity: ${({disabled:e})=>e?.32:1};
`,vs=({checked:e,value:o,onChange:r,onCheckedChange:t,size:n="small",labelPosition:a="right",disabled:i=!1,className:c})=>jsxRuntime.jsxs(Is,{className:c,labelPosition:a,children:[jsxRuntime.jsx(ks,{type:"radio",id:"input-radio",name:"input-radio","data-testid":"input-radio",checked:e,value:o,"radio-size":n,disabled:i,onChange:m=>{r?.(m),t?.(m.target.checked);},initial:{scale:.95},animate:{scale:e?1.05:.95},transition:{type:"spring",stiffness:300,damping:20}}),o&&jsxRuntime.jsx(Cs,{htmlFor:"input-radio",labelPosition:a,disabled:i,children:o})]});vs.Group=Gr;var L=F__default.default.li`
  --horizontal-padding: ${({theme:e})=>e.spacing(1)};
  --vertical-padding: ${({theme:e})=>e.spacing(2)};

  align-items: center;

  background: ${({isKeySelected:e,theme:o})=>e?o.background.transparent.light:o.background.secondary};
  border-radius: ${({theme:e})=>e.border.radius.sm};
  cursor: pointer;

  display: flex;

  flex-direction: row;

  font-size: ${({theme:e})=>e.font.size.sm};

  gap: ${({theme:e})=>e.spacing(2)};

  height: calc(32px - 2 * var(--vertical-padding));
  justify-content: space-between;

  padding: var(--vertical-padding) var(--horizontal-padding);

  ${tr};

  ${({theme:e,accent:o})=>{switch(o){case"danger":return react.css`
          color: ${e.font.color.danger};
          &:hover {
            background: ${e.background.transparent.danger};
          }
        `;case"placeholder":return react.css`
          color: ${e.font.color.tertiary};
        `;case"default":default:return react.css`
          color: ${e.font.color.secondary};
        `}}}

  position: relative;
  user-select: none;

  width: calc(100% - 2 * var(--horizontal-padding));
`,H=F__default.default.div`
  font-size: ${({theme:e})=>e.font.size.sm};
  font-weight: ${({theme:e})=>e.font.weight.regular};
  overflow: hidden;
  padding-left: ${({theme:e,hasLeftIcon:o})=>o?"":e.spacing(1)};
  text-overflow: ellipsis;
  white-space: nowrap;
`;F__default.default.div`
  width: ${({theme:e})=>e.spacing(1)};
`;var v=F__default.default.div`
  align-items: center;
  display: flex;

  flex-direction: row;

  gap: ${({theme:e})=>e.spacing(2)};
  min-width: 0;
  width: 100%;
`,Kr=F__default.default.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`,Le=F__default.default(L)`
  & .hoverable-buttons {
    opacity: ${({isMenuOpen:e})=>e?1:0};
    pointer-events: none;
    position: fixed;
    right: ${({theme:e})=>e.spacing(2)};
    transition: opacity ${({theme:e})=>e.animation.duration.instant}s ease;
  }

  &:hover {
    & .hoverable-buttons {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;var T=({LeftIcon:e,text:o,showGrip:r=!1})=>{let t=react.useTheme();return jsxRuntime.jsxs(v,{children:[r&&jsxRuntime.jsx(iconsReact.IconGripVertical,{size:t.icon.size.md,stroke:t.icon.stroke.sm,color:t.font.color.extraLight}),e&&jsxRuntime.jsx(e,{size:t.icon.size.md,stroke:t.icon.stroke.sm}),jsxRuntime.jsx(H,{hasLeftIcon:!!e,children:jsxRuntime.jsx(X,{text:o})})]})};var Qr=({LeftIcon:e,accent:o="default",text:r,iconButtons:t,isTooltipOpen:n,className:a,testId:i,onClick:c})=>{let s=Array.isArray(t)&&t.length>0;return jsxRuntime.jsxs(Le,{"data-testid":i??void 0,onClick:l=>{c&&(l.preventDefault(),l.stopPropagation(),c?.(l));},className:a,accent:o,isMenuOpen:!!n,children:[jsxRuntime.jsx(v,{children:jsxRuntime.jsx(T,{LeftIcon:e??void 0,text:r})}),jsxRuntime.jsx("div",{className:"hoverable-buttons",children:s&&jsxRuntime.jsx(se,{iconButtons:t,size:"small"})})]})};var Rs=F__default.default.div`
  align-items: center;
  background-color: ${({theme:e})=>e.background.transparent.lighter};
  border: 1px solid ${({theme:e})=>e.border.color.medium};
  border-radius: ${({theme:e})=>e.border.radius.sm};
  color: ${({disabled:e,theme:o})=>e?o.font.color.tertiary:o.font.color.primary};
  cursor: ${({disabled:e})=>e?"not-allowed":"pointer"};
  display: ${({fullWidth:e})=>e?"flex":"inline-flex"};
  gap: ${({theme:e})=>e.spacing(1)};
  height: ${({theme:e})=>e.spacing(8)};
  justify-content: space-between;
  padding: 0 ${({theme:e})=>e.spacing(2)};
`,Jr=F__default.default.span`
  color: ${({theme:e})=>e.font.color.light};
  display: block;
  font-size: ${({theme:e})=>e.font.size.xs};
  font-weight: ${({theme:e})=>e.font.weight.semiBold};
  margin-bottom: ${({theme:e})=>e.spacing(1)};
  text-transform: uppercase;
`,Bs=F__default.default.div`
  align-items: center;
  display: flex;
  gap: ${({theme:e})=>e.spacing(1)};
`,Es=F__default.default(iconsReact.IconChevronDown)`
  color: ${({disabled:e,theme:o})=>e?o.font.color.extraLight:o.font.color.tertiary};
`,_0=({className:e,disabled:o,dropdownScopeId:r,fullWidth:t,label:n,onChange:a,options:i,value:c})=>{let s=react.useTheme(),m=i.find(({value:g})=>g===c)||i[0],{closeDropdown:l}=E({dropdownScopeId:r}),u=jsxRuntime.jsxs(Rs,{disabled:o,fullWidth:t,children:[jsxRuntime.jsxs(Bs,{children:[!!m?.Icon&&jsxRuntime.jsx(m.Icon,{color:o?s.font.color.light:s.font.color.primary,size:s.icon.size.md,stroke:s.icon.stroke.sm}),m?.label]}),jsxRuntime.jsx(Es,{disabled:o,size:s.icon.size.md})]});return o?jsxRuntime.jsxs(jsxRuntime.Fragment,{children:[!!n&&jsxRuntime.jsx(Jr,{children:n}),u]}):jsxRuntime.jsx($e,{dropdownScopeId:r,children:jsxRuntime.jsxs("div",{className:e,children:[!!n&&jsxRuntime.jsx(Jr,{children:n}),jsxRuntime.jsx(ke,{dropdownMenuWidth:176,dropdownPlacement:"bottom-start",clickableComponent:u,dropdownComponents:jsxRuntime.jsx(ve,{children:i.map(g=>jsxRuntime.jsx(Qr,{LeftIcon:g.Icon,text:g.label,onClick:()=>{a?.(g.value),l();}},g.value))}),dropdownHotkeyScope:{scope:"select"}})]})})};var Zr=5,Ds=F__default.default(wi__default.default)`
  background-color: ${({theme:e})=>e.background.transparent.lighter};
  border: 1px solid ${({theme:e})=>e.border.color.medium};
  border-radius: ${({theme:e})=>e.border.radius.sm};
  box-sizing: border-box;
  color: ${({theme:e})=>e.font.color.primary};
  font-family: inherit;
  font-size: ${({theme:e})=>e.font.size.md};
  font-weight: ${({theme:e})=>e.font.weight.regular};
  line-height: 16px;
  overflow: auto;
  padding: ${({theme:e})=>e.spacing(2)};
  padding-top: ${({theme:e})=>e.spacing(3)};
  resize: none;
  width: 100%;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({theme:e})=>e.font.color.light};
    font-weight: ${({theme:e})=>e.font.weight.regular};
  }

  &:disabled {
    color: ${({theme:e})=>e.font.color.tertiary};
  }
`,j0=({disabled:e,placeholder:o,minRows:r=1,value:t="",className:n,onChange:a})=>{let i=Math.min(r,Zr),{goBackToPreviousHotkeyScope:c,setHotkeyScopeAndMemorizePreviousScope:s}=B();return jsxRuntime.jsx(Ds,{placeholder:o,maxRows:Zr,minRows:i,value:t,onChange:u=>a?.(u.target.value),onFocus:()=>{s("text-input");},onBlur:()=>{c();},disabled:e,className:n})};var jr=(...e)=>o=>{for(let r of e)guards.isFunction(r)?r(o):r!=null&&(r.current=o);};var Ws=F__default.default.div`
  display: inline-flex;
  flex-direction: column;
  width: ${({fullWidth:e})=>e?"100%":"auto"};
`,Ys=F__default.default.span`
  color: ${({theme:e})=>e.font.color.light};
  font-size: ${({theme:e})=>e.font.size.xs};
  font-weight: ${({theme:e})=>e.font.weight.semiBold};
  margin-bottom: ${({theme:e})=>e.spacing(1)};
  text-transform: uppercase;
`,Xs=F__default.default.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`,_s=F__default.default.input`
  background-color: ${({theme:e})=>e.background.transparent.lighter};
  border: 1px solid ${({theme:e})=>e.border.color.medium};
  border-bottom-left-radius: ${({theme:e})=>e.border.radius.sm};
  border-right: none;
  border-top-left-radius: ${({theme:e})=>e.border.radius.sm};
  color: ${({theme:e})=>e.font.color.primary};
  display: flex;
  flex-grow: 1;
  font-family: ${({theme:e})=>e.font.family};

  font-weight: ${({theme:e})=>e.font.weight.regular};
  outline: none;
  padding: ${({theme:e})=>e.spacing(2)};

  width: 100%;

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${({theme:e})=>e.font.color.light};
    font-family: ${({theme:e})=>e.font.family};
    font-weight: ${({theme:e})=>e.font.weight.medium};
  }

  &:disabled {
    color: ${({theme:e})=>e.font.color.tertiary};
  }
`,Gs=F__default.default.div`
  color: ${({theme:e})=>e.color.red};
  font-size: ${({theme:e})=>e.font.size.xs};
  padding: ${({theme:e})=>e.spacing(1)};
`,qs=F__default.default.div`
  align-items: center;
  background-color: ${({theme:e})=>e.background.transparent.lighter};
  border: 1px solid ${({theme:e})=>e.border.color.medium};
  border-bottom-right-radius: ${({theme:e})=>e.border.radius.sm};
  border-left: none;
  border-top-right-radius: ${({theme:e})=>e.border.radius.sm};
  display: flex;
  justify-content: center;
  padding-right: ${({theme:e})=>e.spacing(1)};
`,yo=F__default.default.div`
  align-items: center;
  color: ${({theme:e})=>e.font.color.light};
  cursor: ${({onClick:e})=>e?"pointer":"default"};
  display: flex;
  justify-content: center;
`,on="password",Ks=({className:e,label:o,value:r,onChange:t,onFocus:n,onBlur:a,onKeyDown:i,fullWidth:c,error:s,required:m,type:l,disableHotkeys:u=!1,autoFocus:g,placeholder:x,disabled:S,tabIndex:b,RightIcon:h},k)=>{let I=react.useTheme(),y=ze.useRef(null),A=jr(k,y),{goBackToPreviousHotkeyScope:Ne,setHotkeyScopeAndMemorizePreviousScope:Cn}=B(),vn=J=>{n?.(J),u||Cn("text-input");},$n=J=>{a?.(J),u||Ne();};C([tsKeyEnum.Key.Escape,tsKeyEnum.Key.Enter],()=>{y.current?.blur();},"text-input");let[Ue,wn]=ze.useState(!1),Tn=()=>{wn(!Ue);};return jsxRuntime.jsxs(Ws,{className:e,fullWidth:c??!1,children:[o&&jsxRuntime.jsx(Ys,{children:o+(m?"*":"")}),jsxRuntime.jsxs(Xs,{children:[jsxRuntime.jsx(_s,{autoComplete:"off",ref:A,tabIndex:b??0,onFocus:vn,onBlur:$n,type:Ue?"text":l,onChange:J=>{t?.(J.target.value);},onKeyDown:i,autoFocus:g,disabled:S,placeholder:x,required:m,value:r}),jsxRuntime.jsxs(qs,{children:[s&&jsxRuntime.jsx(yo,{children:jsxRuntime.jsx(iconsReact.IconAlertCircle,{size:16,color:I.color.red})}),!s&&l===on&&jsxRuntime.jsx(yo,{onClick:Tn,"data-testid":"reveal-password-button",children:Ue?jsxRuntime.jsx(iconsReact.IconEyeOff,{size:I.icon.size.md}):jsxRuntime.jsx(iconsReact.IconEye,{size:I.icon.size.md})}),!s&&l!==on&&!!h&&jsxRuntime.jsx(yo,{children:jsxRuntime.jsx(h,{size:I.icon.size.md})})]})]}),s&&jsxRuntime.jsx(Gs,{children:s})]})},hS=ze.forwardRef(Ks);var js=F__default.default.div`
  align-items: center;
  background-color: ${({theme:e,isOn:o,color:r})=>o?r??e.color.blue:e.background.quaternary};
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  height: ${({toggleSize:e})=>e==="small"?16:20}px;
  transition: background-color 0.3s ease;
  width: ${({toggleSize:e})=>e==="small"?24:32}px;
`,el=F__default.default(framerMotion.motion.div)`
  background-color: ${({theme:e})=>e.background.primary};
  border-radius: 50%;
  height: ${({size:e})=>e==="small"?12:16}px;
  width: ${({size:e})=>e==="small"?12:16}px;
`,nn=({value:e,onChange:o,color:r,toggleSize:t="medium",className:n})=>{let[a,i]=ze.useState(e??!1),c={on:{x:t==="small"?10:14},off:{x:2}},s=()=>{i(!a),o&&o(!a);};return ze.useEffect(()=>{e!==a&&i(e??!1);},[e]),jsxRuntime.jsx(js,{onClick:s,isOn:a,color:r,toggleSize:t,className:n,children:jsxRuntime.jsx(el,{animate:a?"on":"off",variants:c,size:t})})};var nl=F__default.default.div`
  min-height: 200px;
  width: 100%;
  & .editor {
    background: ${({theme:e})=>e.background.primary};
    font-size: 13px;
    color: ${({theme:e})=>e.font.color.primary};
  }
  & .editor [class^='_inlineContent']:before {
    color: ${({theme:e})=>e.font.color.tertiary};
    font-style: normal !important;
  }
`,LS=({editor:e})=>{let r=react.useTheme().name=="light"?"light":"dark";return jsxRuntime.jsx(nl,{children:jsxRuntime.jsx(react$1.BlockNoteView,{editor:e,theme:r})})};var cl=F__default.default.div`
  display: flex;
  overflow: hidden;
  white-space: nowrap;

  a {
    color: inherit;
    overflow: hidden;
    text-decoration: underline;
    text-decoration-color: ${({theme:e})=>e.border.color.strong};
    text-overflow: ellipsis;

    &:hover {
      text-decoration-color: ${({theme:e})=>e.font.color.primary};
    }
  }
`,MS=({className:e,href:o,children:r,onClick:t})=>jsxRuntime.jsx("div",{children:jsxRuntime.jsx(cl,{className:e,children:jsxRuntime.jsx(reactRouterDom.Link,{target:"_blank",onClick:t,to:o,children:r})})});var pl=F__default.default.div`
  display: flex;
  overflow: hidden;
  white-space: nowrap;

  a {
    color: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`,NS=({className:e,href:o,children:r,onClick:t})=>jsxRuntime.jsx("div",{children:jsxRuntime.jsx(pl,{className:e,children:jsxRuntime.jsx(reactRouterDom.Link,{target:"_blank",onClick:t,to:o,children:r})})});var ul=F__default.default.div`
  overflow: hidden;
  white-space: nowrap;

  a {
    color: inherit;
    overflow: hidden;
    text-decoration: none;
    text-overflow: ellipsis;
  }
`,cn=({children:e,href:o,onClick:r})=>jsxRuntime.jsx("div",{children:e!==""?jsxRuntime.jsx(ul,{children:jsxRuntime.jsx(reactRouterDom.Link,{target:"_blank",to:o,onClick:r,children:jsxRuntime.jsx(ie,{label:`${e}`,variant:"rounded",size:"small"})})}):jsxRuntime.jsx(jsxRuntime.Fragment,{})});var yl=(t=>(t.Url="url",t.LinkedIn="linkedin",t.Twitter="twitter",t))(yl||{}),bl=F__default.default(cn)`
  overflow: hidden;

  a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`,KS=({children:e,href:o,onClick:r,type:t})=>{let n=e;if(t==="linkedin"){let a=o.match(/(?:https?:\/\/)?(?:www.)?linkedin.com\/(?:in|company)\/([-a-zA-Z0-9@:%_+.~#?&//=]*)/);a&&a[1]?n=a[1]:n="LinkedIn";}if(t==="twitter"){let a=o.match(/(?:https?:\/\/)?(?:www.)?twitter.com\/([-a-zA-Z0-9@:%_+.~#?&//=]*)/);a&&a[1]?n=`@${a[1]}`:n="@twitter";}return jsxRuntime.jsx(bl,{href:o,onClick:r,children:n})};var xl=F__default.default.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({theme:e})=>e.spacing(1)};
  justify-content: center;
`,Sl=F__default.default.div`
  color: ${({theme:e})=>e.font.color.light};
  padding-bottom: ${({theme:e})=>e.spacing(1)};
  padding-left: ${({theme:e})=>e.spacing(2)};
  padding-right: ${({theme:e})=>e.spacing(2)};
  padding-top: ${({theme:e})=>e.spacing(1)};
  white-space: nowrap;
`,sn=F__default.default.div`
  align-items: center;
  background-color: ${({theme:e})=>e.background.secondary};
  border: 1px solid ${({theme:e})=>e.border.color.strong};
  border-radius: ${({theme:e})=>e.border.radius.sm};
  box-shadow: ${({theme:e})=>e.boxShadow.underline};
  display: flex;
  flex-direction: column;

  height: ${({theme:e})=>e.spacing(5)};
  height: 18px;
  justify-content: center;
  text-align: center;
  width: ${({theme:e})=>e.spacing(4)};
`,pn=({firstHotKey:e,secondHotKey:o,joinLabel:r="then"})=>jsxRuntime.jsx(Sl,{children:e&&jsxRuntime.jsxs(xl,{children:[jsxRuntime.jsx(sn,{children:e}),o&&jsxRuntime.jsxs(jsxRuntime.Fragment,{children:[r,jsxRuntime.jsx(sn,{children:o})]})]})});var Cl=F__default.default(H)`
  color: ${({theme:e})=>e.font.color.primary};
`,vl=F__default.default.div`
  align-items: center;
  background: ${({theme:e})=>e.background.transparent.light};
  border-radius: ${({theme:e})=>e.border.radius.sm};

  display: flex;

  flex-direction: row;

  padding: ${({theme:e})=>e.spacing(1)};
`,$l=F__default.default.div`
  --horizontal-padding: ${({theme:e})=>e.spacing(1)};
  --vertical-padding: ${({theme:e})=>e.spacing(2)};
  align-items: center;
  background: ${({isSelected:e,theme:o})=>e?o.background.transparent.light:o.background.primary};
  border-radius: ${({theme:e})=>e.border.radius.sm};
  color: ${({theme:e})=>e.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-size: ${({theme:e})=>e.font.size.sm};
  gap: ${({theme:e})=>e.spacing(2)};
  justify-content: space-between;
  padding: var(--vertical-padding) var(--horizontal-padding);
  position: relative;
  transition: all 150ms ease;
  transition-property: none;
  user-select: none;
  width: calc(100% - 2 * var(--horizontal-padding));
  &:hover {
    background: ${({theme:e})=>e.background.transparent.light};
  }
  &[data-selected='true'] {
    background: ${({theme:e})=>e.background.tertiary};
  }
  &[data-disabled='true'] {
    color: ${({theme:e})=>e.font.color.light};
    cursor: not-allowed;
  }
  svg {
    height: 16px;
    width: 16px;
  }
`,aI=({LeftIcon:e,text:o,firstHotKey:r,secondHotKey:t,className:n,isSelected:a,onClick:i})=>{let c=react.useTheme();return jsxRuntime.jsxs($l,{onClick:i,className:n,isSelected:a,children:[jsxRuntime.jsxs(v,{children:[e&&jsxRuntime.jsx(vl,{children:jsxRuntime.jsx(e,{size:c.icon.size.sm})}),jsxRuntime.jsx(Cl,{hasLeftIcon:!!e,children:o})]}),jsxRuntime.jsx(pn,{firstHotKey:r,secondHotKey:t})]})};var dI=({LeftIcon:e,accent:o="default",iconButtons:r,isTooltipOpen:t,onClick:n,text:a,isDragDisabled:i=!1,className:c})=>{let s=Array.isArray(r)&&r.length>0;return jsxRuntime.jsxs(Le,{onClick:n,accent:o,className:c,isMenuOpen:!!t,children:[jsxRuntime.jsx(T,{LeftIcon:e,text:a,showGrip:!i}),s&&jsxRuntime.jsx(se,{className:"hoverable-buttons",iconButtons:r})]})};var Pl=F__default.default.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({theme:e})=>e.spacing(2)};
`,hI=({LeftIcon:e,text:o,selected:r,className:t,onSelectChange:n})=>jsxRuntime.jsx(L,{className:t,onClick:()=>{n?.(!r);},children:jsxRuntime.jsxs(Pl,{children:[jsxRuntime.jsx(ue,{checked:r}),jsxRuntime.jsx(T,{LeftIcon:e,text:o})]})});var Bl=F__default.default.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({theme:e})=>e.spacing(2)};
`,vI=({avatar:e,text:o,selected:r,className:t,isKeySelected:n,onSelectChange:a})=>jsxRuntime.jsx(L,{className:t,onClick:()=>{a?.(!r);},isKeySelected:n,children:jsxRuntime.jsxs(Bl,{children:[jsxRuntime.jsx(ue,{checked:r}),jsxRuntime.jsxs(v,{children:[e,jsxRuntime.jsx(H,{hasLeftIcon:!!e,children:o})]})]})});var BI=({LeftIcon:e,text:o,className:r,onClick:t})=>{let n=react.useTheme();return jsxRuntime.jsxs(L,{onClick:t,className:r,children:[jsxRuntime.jsx(v,{children:jsxRuntime.jsx(T,{LeftIcon:e,text:o})}),jsxRuntime.jsx(iconsReact.IconChevronRight,{size:n.icon.size.sm})]})};var ne=F__default.default(L)`
  ${({theme:e,selected:o,disabled:r,hovered:t})=>{if(o)return react.css`
        background: ${e.background.transparent.light};
        &:hover {
          background: ${e.background.transparent.medium};
        }
      `;if(r)return react.css`
        background: inherit;
        &:hover {
          background: inherit;
        }

        color: ${e.font.color.tertiary};

        cursor: default;
      `;if(t)return react.css`
        background: ${e.background.transparent.light};
      `}}
`,NI=({LeftIcon:e,text:o,selected:r,className:t,onClick:n,disabled:a,hovered:i})=>{let c=react.useTheme();return jsxRuntime.jsxs(ne,{onClick:n,className:t,selected:r,disabled:a,hovered:i,children:[jsxRuntime.jsx(T,{LeftIcon:e,text:o}),r&&jsxRuntime.jsx(iconsReact.IconCheck,{size:c.icon.size.sm})]})};var GI=({avatar:e,text:o,selected:r,className:t,onClick:n,disabled:a,hovered:i,testId:c})=>{let s=react.useTheme();return jsxRuntime.jsxs(ne,{onClick:n,className:t,selected:r,disabled:a,hovered:i,"data-testid":c,children:[jsxRuntime.jsxs(v,{children:[e,jsxRuntime.jsx(H,{hasLeftIcon:!!e,children:jsxRuntime.jsx(X,{text:o})})]}),r&&jsxRuntime.jsx(iconsReact.IconCheck,{size:s.icon.size.sm})]})};var yn=F__default.default.div`
  background-color: ${({theme:e,colorName:o})=>e.tag.background[o]};
  border: 1px solid ${({theme:e,colorName:o})=>e.tag.text[o]};
  border-radius: 60px;
  height: ${({theme:e})=>e.spacing(4)};
  width: ${({theme:e})=>e.spacing(3)};

  ${({colorName:e,theme:o,variant:r})=>{if(r==="pipeline")return react.css`
        align-items: center;
        border: 0;
        display: flex;
        justify-content: center;

        &:after {
          background-color: ${o.tag.text[e]};
          border-radius: ${o.border.radius.rounded};
          content: '';
          display: block;
          height: ${o.spacing(1)};
          width: ${o.spacing(1)};
        }
      `}}
`;var Ol={green:"Green",turquoise:"Turquoise",sky:"Sky",blue:"Blue",purple:"Purple",pink:"Pink",red:"Red",orange:"Orange",yellow:"Yellow",gray:"Gray"},ak=({color:e,selected:o,className:r,onClick:t,disabled:n,hovered:a,variant:i="default"})=>{let c=react.useTheme();return jsxRuntime.jsxs(ne,{onClick:t,className:r,selected:o,disabled:n,hovered:a,children:[jsxRuntime.jsxs(v,{children:[jsxRuntime.jsx(yn,{colorName:e,variant:i}),jsxRuntime.jsx(H,{hasLeftIcon:!0,children:Ol[e]})]}),o&&jsxRuntime.jsx(iconsReact.IconCheck,{size:c.icon.size.sm})]})};var mk=({LeftIcon:e,text:o,toggled:r,className:t,onToggleChange:n,toggleSize:a})=>jsxRuntime.jsxs(L,{className:t,onClick:()=>{n?.(!r);},children:[jsxRuntime.jsx(T,{LeftIcon:e,text:o}),jsxRuntime.jsx(Kr,{children:jsxRuntime.jsx(nn,{value:r,onChange:n,toggleSize:a})})]});var Xl=F__default.default.nav`
  align-items: center;
  color: ${({theme:e})=>e.font.color.extraLight};
  display: flex;
  font-size: ${({theme:e})=>e.font.size.lg};
  font-weight: ${({theme:e})=>e.font.weight.semiBold};
  gap: ${({theme:e})=>e.spacing(2)};
  line-height: ${({theme:e})=>e.text.lineHeight.md};
`,_l=F__default.default(reactRouterDom.Link)`
  color: inherit;
  text-decoration: none;
`,Gl=F__default.default.span`
  color: ${({theme:e})=>e.font.color.tertiary};
`,hk=({className:e,links:o})=>jsxRuntime.jsx(Xl,{className:e,children:o.map((r,t)=>jsxRuntime.jsxs(ze.Fragment,{children:[r.href?jsxRuntime.jsx(_l,{to:r.href,children:r.children}):jsxRuntime.jsx(Gl,{children:r.children}),t<o.length-1&&"/"]},t))});var Jl=F__default.default.div`
  align-items: center;
  background-color: ${({isActive:e,theme:o})=>e?o.background.transparent.light:"none"};
  border-radius: ${({theme:e})=>e.spacing(1)};
  cursor: pointer;
  display: flex;
  height: ${({theme:e})=>e.spacing(10)};
  justify-content: center;
  transition: background-color ${({theme:e})=>e.animation.duration.fast}s
    ease;
  width: ${({theme:e})=>e.spacing(10)};

  &:hover {
    background-color: ${({theme:e})=>e.background.transparent.light};
  }
`,xn=({Icon:e,isActive:o,onClick:r})=>{let t=react.useTheme();return jsxRuntime.jsx(Jl,{isActive:o,onClick:r,children:jsxRuntime.jsx(e,{color:t.color.gray50,size:t.icon.size.lg})})};var jl=F__default.default.div`
  display: flex;
  gap: ${({theme:e})=>e.spacing(4)};
  justify-content: center;
  padding: ${({theme:e})=>e.spacing(3)};
`,Tk=({activeItemName:e,items:o})=>jsxRuntime.jsx(jl,{children:o.map(({Icon:r,name:t,onClick:n})=>jsxRuntime.jsx(xn,{Icon:r,isActive:e===t,onClick:n},t))});var Ae=()=>reactResponsive.useMediaQuery({query:`(max-width: ${Y}px)`});var tp=F__default.default.div`
  align-items: center;
  display: flex;
  flex-grow: ${({isLast:e})=>e?"0":"1"};
  @media (max-width: ${Y}px) {
    flex-grow: 0;
  }
`,rp=F__default.default(framerMotion.motion.div)`
  align-items: center;
  border-radius: 50%;
  border-style: solid;
  border-width: 1px;
  display: flex;
  flex-basis: auto;
  flex-shrink: 0;
  height: 20px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 20px;
`,np=F__default.default.span`
  color: ${({theme:e})=>e.font.color.tertiary};
  font-size: ${({theme:e})=>e.font.size.md};
  font-weight: ${({theme:e})=>e.font.weight.medium};
`,ap=F__default.default.span`
  color: ${({theme:e,isActive:o})=>o?e.font.color.primary:e.font.color.tertiary};
  font-size: ${({theme:e})=>e.font.size.md};
  font-weight: ${({theme:e})=>e.font.weight.medium};
  margin-left: ${({theme:e})=>e.spacing(2)};
  white-space: nowrap;
`,ip=F__default.default(framerMotion.motion.div)`
  height: 2px;
  margin-left: ${({theme:e})=>e.spacing(2)};
  margin-right: ${({theme:e})=>e.spacing(2)};
  overflow: hidden;
  width: 100%;
`,Fe=({isActive:e=!1,isLast:o=!1,index:r=0,label:t,children:n})=>{let a=react.useTheme(),i=Ae(),c={active:{backgroundColor:a.font.color.primary,borderColor:a.font.color.primary,transition:{duration:.5}},inactive:{backgroundColor:a.background.transparent.lighter,borderColor:a.border.color.medium,transition:{duration:.5}}},s={active:{backgroundColor:a.font.color.primary,transition:{duration:.5}},inactive:{backgroundColor:a.border.color.medium,transition:{duration:.5}}};return jsxRuntime.jsxs(tp,{isLast:o,children:[jsxRuntime.jsxs(rp,{variants:c,animate:e?"active":"inactive",children:[e&&jsxRuntime.jsx(ht,{isAnimating:e,color:a.grayScale.gray0}),!e&&jsxRuntime.jsx(np,{children:r+1})]}),jsxRuntime.jsx(ap,{isActive:e,children:t}),!o&&!i&&jsxRuntime.jsx(ip,{variants:s,animate:e?"active":"inactive"}),e&&n]})};Fe.displayName="StepBar";var sp=F__default.default.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  @media (max-width: ${Y}px) {
    align-items: center;
    justify-content: center;
  }
`,lp=({activeStep:e,children:o})=>{let r=Ae();return jsxRuntime.jsx(sp,{children:ze__namespace.default.Children.map(o,(t,n)=>ze__namespace.default.isValidElement(t)?t.type?.displayName!==Fe.displayName?t:r&&(e===-1?n!==0:n!==e)?null:ze__namespace.default.cloneElement(t,{index:n,isActive:n<=e,isLast:n===ze__namespace.default.Children.count(o)-1}):null)})};lp.Step=Fe;

Object.defineProperty(exports, "ThemeProvider", {
  enumerable: true,
  get: function () { return react.ThemeProvider; }
});
exports.AnimatedCheckmark = ht;
exports.AppTooltip = xt;
exports.AutosizeTextInput = Ff;
exports.AutosizeTextInputVariant = Ti;
exports.BlockEditor = LS;
exports.Breadcrumb = hk;
exports.Button = _;
exports.ButtonGroup = fg;
exports.Checkbox = ue;
exports.CheckboxShape = Ni;
exports.CheckboxSize = Ui;
exports.CheckboxVariant = zi;
exports.Checkmark = Oe;
exports.Chip = ie;
exports.ChipAccent = jn;
exports.ChipSize = kt;
exports.ChipVariant = We;
exports.CircularProgressBar = ng;
exports.ColorSchemeCard = le;
exports.ColorSchemePicker = df;
exports.ContactLink = MS;
exports.EntityChip = $u;
exports.EntityChipVariant = da;
exports.EntityTitleDoubleTextInput = Wy;
exports.FloatingButton = Sg;
exports.FloatingButtonGroup = $g;
exports.FloatingIconButton = Ut;
exports.FloatingIconButtonGroup = se;
exports.IconAddressBook = Eu;
exports.IconPicker = Zx;
exports.ImageInput = i0;
exports.LabelPosition = Ss;
exports.LightButton = Ug;
exports.LightIconButton = Wt;
exports.LinkType = yl;
exports.MainButton = Kg;
exports.MenuItem = Qr;
exports.MenuItemCommand = aI;
exports.MenuItemDraggable = dI;
exports.MenuItemMultiSelect = hI;
exports.MenuItemMultiSelectAvatar = vI;
exports.MenuItemNavigate = BI;
exports.MenuItemSelect = NI;
exports.MenuItemSelectAvatar = GI;
exports.MenuItemSelectColor = ak;
exports.MenuItemToggle = mk;
exports.NavigationBar = Tk;
exports.OverflowingTextWithTooltip = X;
exports.ProgressBar = Zu;
exports.Radio = vs;
exports.RadioGroup = Gr;
exports.RadioSize = xs;
exports.RawLink = NS;
exports.RoundedIconButton = Xt;
exports.RoundedLink = cn;
exports.Select = _0;
exports.SocialLink = KS;
exports.SoonPill = Tt;
exports.StepBar = lp;
exports.StyledMenuItemSelect = ne;
exports.Tag = Yu;
exports.TextArea = j0;
exports.TextInput = hS;
exports.Toggle = nn;
exports.TooltipPosition = On;
exports.colorLabels = Ol;
exports.darkTheme = Hn;
exports.lightTheme = En;
