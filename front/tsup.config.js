import { defineConfig } from "tsup";
 
export default defineConfig([
  {
    entry: ["src/modules/ui/index.tsx"], // your library path
    treeshake: true,
    minify: true,
    verbose: true,
    dts: true,
    external: ["react", "react-dom"],
    clean: true,
    outDir: "../docs/ui/build-sandpack", // build output
    noExternal: ['@emotion/react', '@emotion/styled', '@tabler/icons-react', 'hex-rgb']
  },
]);