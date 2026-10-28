import { transform } from '@swc/core';
import { type Plugin } from 'esbuild';
import { readFile } from 'fs/promises';
import { dirname } from 'path';

export const createLinguiPlugin = ({
  swcConfigPath,
}: {
  swcConfigPath: string;
}): Plugin => ({
  name: 'lingui-macros',
  setup(build) {
    build.onLoad({ filter: /\.ts$/ }, async ({ path }) => {
      const source = await readFile(path, 'utf8');

      if (!source.includes('@lingui/core/macro')) {
        return;
      }

      const { code } = await transform(source, {
        filename: path,
        configFile: swcConfigPath,
        module: { type: 'es6' },
        sourceMaps: false,
      });

      return { contents: code, loader: 'js', resolveDir: dirname(path) };
    });
  },
});
