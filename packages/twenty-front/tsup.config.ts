import { Config } from '@svgr/core';
import svgr from 'esbuild-plugin-svgr';
import { defineConfig } from 'tsup';

const template: Config['template'] = (variables, { tpl }) => {
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

export default defineConfig([
  {
    entry: { index: './tsup.ui.index.tsx' },
    treeshake: true,
    minify: true,
    dts: true,
    clean: true,
    outDir: '../twenty-docs/src/ui/generated',
    esbuildPlugins: [svgr({ template })],
  },
]);


