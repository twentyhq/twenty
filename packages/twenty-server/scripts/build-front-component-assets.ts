import { mkdir, rm } from 'fs/promises';
import { resolve } from 'path';
import { build } from 'esbuild';

import { createLinguiPlugin } from './utils/create-lingui-plugin';

const buildAssets = async () => {
  const directory = resolve(
    __dirname,
    '../src/engine/metadata-modules/ai/ai-front-component/generated',
  );
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
  await build({
    entryPoints: {
      index: resolve(
        __dirname,
        '../src/engine/metadata-modules/ai/ai-front-component/front-component-builder.handler.ts',
      ),
      local: resolve(
        __dirname,
        '../src/engine/metadata-modules/ai/ai-front-component/front-component-builder.local.ts',
      ),
    },
    outdir: directory,
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    external: ['esbuild'],
    plugins: [
      createLinguiPlugin({ swcConfigPath: resolve(__dirname, '../.swcrc') }),
    ],
    tsconfig: resolve(__dirname, '../tsconfig.json'),
  });
};

buildAssets().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
