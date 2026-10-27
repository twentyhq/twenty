import { mkdir, rm } from 'fs/promises';
import { join, resolve } from 'path';
import { build } from 'esbuild';

const buildAssets = async () => {
  const directory = resolve(
    __dirname,
    '../src/engine/metadata-modules/ai/ai-front-component/generated',
  );
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
  await build({
    entryPoints: [
      resolve(
        __dirname,
        '../src/engine/metadata-modules/ai/ai-front-component/front-component-builder.handler.ts',
      ),
    ],
    outfile: join(directory, 'index.js'),
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    external: ['esbuild'],
    tsconfig: resolve(__dirname, '../tsconfig.json'),
  });
};

buildAssets().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
