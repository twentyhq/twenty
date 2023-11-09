import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from "@codesandbox/sandpack-react";
import uiModule from "!!raw-loader!@site/src/ui/generated/index.js";

export const SandpackEditor = ({ availableComponentPaths, componentCode}) => {
  const fakePackagesJson = availableComponentPaths.reduce((acc, componentPath, index) => {
    acc[`/node_modules/${componentPath}/package.json`] = {
      hidden: false,
      code: JSON.stringify({
        name: componentPath,
        main: "./index.js",
      }),
    };
    return acc;
  }, {});

  const fakeIndexesJs = availableComponentPaths.reduce((acc, componentPath, index) => {
    acc[`/node_modules/${componentPath}/index.js`] = {
      hidden: false,
      code: uiModule,
    };
    return acc;
  }
  , {});

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
          code: `import { ThemeProvider } from "@emotion/react";
import { lightTheme, darkTheme } from "${availableComponentPaths[0]}";
import { MyComponent } from "./MyComponent.tsx";

console.log("lightTheme", lightTheme);

export default function App() {
return (<ThemeProvider theme={lightTheme}>
 <MyComponent />
</ThemeProvider>);
};`,
        },
        "/MyComponent.tsx": {
          code: componentCode,
        },
        ...fakePackagesJson,
        ...fakeIndexesJs,
      }}
      customSetup={{
        entry: "/index.js",
        dependencies: {
          react: "latest",
          "react-dom": "latest",
          "react-scripts": "^5.0.0",
          "@emotion/react": "^11.10.6",
          '@emotion/styled': "latest",
          '@tabler/icons-react': "latest",
          'hex-rgb': "latest"
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
