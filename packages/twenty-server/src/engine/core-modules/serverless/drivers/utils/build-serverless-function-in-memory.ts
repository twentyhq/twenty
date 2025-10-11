import { join } from 'path';

import { build } from 'esbuild';

export const buildServerlessFunctionInMemory = async (
  sourceTemporaryDir: string,
) => {
  const entryFilePath = join(sourceTemporaryDir, 'src', 'index.ts');

  const builtBundleFilePath = join(sourceTemporaryDir, 'dist', 'main.mjs');

  await build({
    entryPoints: [entryFilePath],
    outfile: builtBundleFilePath,
    platform: 'node',
    format: 'esm',
    target: 'es2017',
    bundle: true,
    sourcemap: true,
    packages: 'external',
  });

  return builtBundleFilePath;
};
