// Mock component code that runs inside the remote worker

import { isDefined } from 'twenty-shared/utils';

// Uses globalThis.React and globalThis.RemoteComponents which are exposed by the worker
const mockFrontComponentCode = `
var r=globalThis.React.useState,s=globalThis.React.useEffect;var n=globalThis.jsx,o=globalThis.jsxs,g=globalThis.React.Fragment;var e=globalThis.RemoteComponents,x=()=>{let[a,l]=r(0),[m,p]=r(0);return s(()=>{let t=setInterval(()=>{p(i=>i+1)},1e3);return()=>clearInterval(t)},[]),o(e.HtmlDiv,{style:{padding:"20px",fontFamily:"Arial, sans-serif",maxWidth:"400px",margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center"},children:[n(e.HtmlH1,{style:{color:"#333",marginBottom:"20px",fontSize:"24px"},children:"Test Component"}),o(e.HtmlP,{style:{fontSize:"18px",marginBottom:"10px",color:"#666"},children:["Count: ",a]}),o(e.HtmlP,{style:{fontSize:"18px",marginBottom:"20px",color:"#666"},children:["Timer: ",m,"s"]}),n(e.HtmlButton,{onClick:()=>l(a+1),style:{padding:"10px 20px",fontSize:"16px",backgroundColor:"#007bff",color:"white",border:"none",borderRadius:"5px",cursor:"pointer",transition:"all 0.3s ease",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.2)"},onMouseEnter:t=>{t.currentTarget.style.backgroundColor="#0056b3",t.currentTarget.style.transform="translateY(-2px)",t.currentTarget.style.boxShadow="0 4px 8px rgba(0, 0, 0, 0.3)"},onMouseLeave:t=>{t.currentTarget.style.backgroundColor="#007bff",t.currentTarget.style.transform="translateY(0)",t.currentTarget.style.boxShadow="0 2px 4px rgba(0, 0, 0, 0.2)"},children:"Increment"})]})},b=globalThis.jsx(x,{});export{b as default};
//# sourceMappingURL=test-component.front-component.mjs.map
`;

let cachedMockBlobUrl: string | null = null;

export const getMockFrontComponentUrl = (): string => {
  if (isDefined(cachedMockBlobUrl)) {
    return cachedMockBlobUrl;
  }

  const blob = new Blob([mockFrontComponentCode], {
    type: 'application/javascript',
  });
  cachedMockBlobUrl = URL.createObjectURL(blob);

  return cachedMockBlobUrl;
};
