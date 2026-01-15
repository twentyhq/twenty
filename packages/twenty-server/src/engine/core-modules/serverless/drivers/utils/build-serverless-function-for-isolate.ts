import { join } from 'path';

import { build } from 'esbuild';

// Uses IIFE format (not ESM) because isolated-vm doesn't support ES modules
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
    packages: 'external',
    minify: false,
  });

  return builtBundleFilePath;
};
