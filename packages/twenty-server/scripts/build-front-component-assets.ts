import { mkdir, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { build } from 'esbuild';
import { buildFrontComponentSharedDependencies } from '../src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-shared-dependencies.util';

const buildAssets = async () => {
  const directory = resolve(
    __dirname,
    '../src/engine/metadata-modules/ai/ai-front-component/generated',
  );
  await mkdir(directory, { recursive: true });
  const vendor = await buildFrontComponentSharedDependencies();
  await writeFile(join(directory, 'shared-dependencies.mjs'), vendor.source);
  await writeFile(
    join(directory, 'shared-dependencies.json'),
    JSON.stringify({
      checksum: vendor.checksum,
      exports: Object.fromEntries(vendor.exportNamesBySpecifier),
    }),
  );
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
