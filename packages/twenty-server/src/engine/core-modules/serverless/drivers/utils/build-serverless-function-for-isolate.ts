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
    platform: 'browser', // Use browser platform to avoid Node.js built-in imports
    format: 'iife',
    globalName: '__serverlessExports',
    target: 'es2020',
    bundle: true,
    sourcemap: false,
    // Don't mark packages as external - bundle them for isolated-vm
    minify: false,
  });

  return builtBundleFilePath;
};
