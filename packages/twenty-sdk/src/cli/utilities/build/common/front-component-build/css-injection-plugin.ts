import { readFile } from 'node:fs/promises';

import type * as esbuild from 'esbuild';

const buildStyleInjectionModule = (cssText: string): string =>
  `if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  document.head.appendChild(styleElement);
  styleElement.textContent = ${JSON.stringify(cssText)};
}`;

export const cssInjectionPlugin: esbuild.Plugin = {
  name: 'css-injection',
  setup: (build) => {
    build.onLoad({ filter: /\.css$/ }, async ({ path }) => {
      const cssText = await readFile(path, 'utf8');

      return {
        contents: buildStyleInjectionModule(cssText),
        loader: 'js',
      };
    });
  },
};
