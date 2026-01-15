import { join } from 'path';

import { build } from 'esbuild';

export const buildServerlessFunctionForIsolate = async ({
  sourceTemporaryDir,
  handlerPath,
}: {
  sourceTemporaryDir: string;
  handlerPath: string;
}): Promise<string> => {
  const entryFilePath = join(sourceTemporaryDir, handlerPath);
  const builtBundleFilePath = join(sourceTemporaryDir, 'dist', 'isolate.js');

  await build({
    entryPoints: [entryFilePath],
    outfile: builtBundleFilePath,
    platform: 'node',
    format: 'iife',
    globalName: '__serverlessExports',
    target: 'es2020',
    bundle: true,
    sourcemap: false,
    minify: false,
  });

  return builtBundleFilePath;
};
