import * as esbuild from 'esbuild';
import { getWatchInputPlugins } from '@/app/dev/collect-watch-inputs';

const buildStyleInjectionModule = (cssText: string): string =>
  `if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  document.head.appendChild(styleElement);
  styleElement.textContent = ${JSON.stringify(cssText)};
}`;

export const cssInjectionPlugin: esbuild.Plugin = {
  name: 'css-injection',
  setup: (build) => {
    build.onLoad({ filter: /\.css$/, namespace: 'file' }, async ({ path }) => {
      const result = await esbuild.build({
        entryPoints: [path],
        bundle: true,
        write: false,
        outfile: 'injected.css',
        logLevel: 'silent',
        plugins: getWatchInputPlugins(),
        loader: Object.fromEntries(
          [
            '.png',
            '.jpg',
            '.jpeg',
            '.gif',
            '.svg',
            '.webp',
            '.avif',
            '.ico',
            '.woff',
            '.woff2',
            '.ttf',
            '.eot',
            '.otf',
          ].map((extension) => [extension, 'dataurl']),
        ),
      });
      const cssText = result.outputFiles[0].text;

      return {
        contents: buildStyleInjectionModule(cssText),
        loader: 'js',
      };
    });
  },
};
