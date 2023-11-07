import { defineConfig } from "tsup";
 
export default defineConfig([
  {
    entry: {"index": './tsup.ui.index.tsx'},
    treeshake: true,
    minify: true,
    verbose: true,
    dts: true,
    clean: true,
    outDir: "../docs/src/ui/generated",
  },
]);