import { defineConfig } from "tsup";
import svgr from 'esbuild-plugin-svgr'
 
export default defineConfig([
  {
    entry: {"index": './tsup.ui.index.tsx'},
    treeshake: true,
    minify: true,
    verbose: true,
    dts: true,
    clean: true,
    outDir: "../twenty-docs/src/ui/generated",
    esbuildPlugins: [svgr({ template })],
  },
]);

function template(variables, { tpl }) {
  return tpl`
    ${variables.imports};
    ${variables.interfaces};
    const ${variables.componentName} = (${variables.props}) => (
      ${variables.jsx}
    ); 
    ${variables.exports};
    export const ReactComponent = ${variables.componentName};
  `;
};