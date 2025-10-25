import { join } from 'path';

import { build } from 'esbuild';

export const buildServerlessFunctionInMemory = async ({
  sourceTemporaryDir,
  handlerPath,
}: {
  sourceTemporaryDir: string;
  handlerPath: string;
}) => {
  const entryFilePath = join(sourceTemporaryDir, handlerPath);

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
