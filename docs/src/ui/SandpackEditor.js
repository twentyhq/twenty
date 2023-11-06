import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from "@codesandbox/sandpack-react";
import uiModule from "!!raw-loader!@site/src/ui/generated/index.js";

export const SandpackEditor = ({ componentPath, componentCode}) => {
  return (
    <SandpackProvider
      files={{
        "/index.js": {
          hidden: true,
          code: `
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
 <StrictMode>
   <App />
 </StrictMode>
);`,
        },
        "/App.tsx": {
          hidden: true,
          code: `import { ThemeProvider } from "${componentPath}";
import { MyComponent } from "./MyComponent.tsx";

export default function App() {
return (<ThemeProvider>
 <MyComponent />
</ThemeProvider>);
};`,
        },
        "/MyComponent.tsx": {
          code: componentCode,
        },
        [`/node_modules/${componentPath}/package.json`]: {
          hidden: true,
          code: JSON.stringify({
            name: componentPath,
            main: "./index.js",
          }),
        },
        [`/node_modules/${componentPath}/index.js`]: {
          hidden: true,
          code: uiModule,
        },
      }}
      customSetup={{
        entry: "/index.js",
        dependencies: {
          react: "latest",
          "react-dom": "latest",
          "react-scripts": "^5.0.0",
        },
      }}
    >
     <SandpackLayout>
        <SandpackCodeEditor
          style={{ minWidth: "100%", height: "auto" }}
        />
        <SandpackPreview 
          style={{ minWidth: "100%", height: "auto" }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
};
