import path from 'path';
import * as fs from 'fs-extra';
import { createRequire } from 'module';
import * as esbuild from 'esbuild';
import os from 'os';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export const extractManifestFromFile = async <T>({
  filePath,
  appPath,
}: {
  filePath: string;
  appPath: string;
}): Promise<T> => {
  const module = await loadModule({ filePath, appPath });

  const result = extractConfigFromModule<T>(module);

  if (!result) {
    throw new Error(
      `Config file ${filePath} must export a config object default export`,
    );
  }

  return result;
};

const loadModule = async ({
  filePath,
  appPath,
}: {
  filePath: string;
  appPath: string;
}): Promise<Record<string, unknown>> => {
  const tsconfigPath = path.join(appPath, 'tsconfig.json');
  const hasTsconfig = await fs.pathExists(tsconfigPath);

  // Resolve react from the app's node_modules for the alias
  const appRequire = createRequire(path.join(appPath, 'package.json'));
  let reactPath: string | undefined;
  let reactDomPath: string | undefined;

  try {
    reactPath = path.dirname(appRequire.resolve('react/package.json'));
    reactDomPath = path.dirname(appRequire.resolve('react-dom/package.json'));
  } catch {
    // React not installed in app, will be bundled if used
  }

  const result = await esbuild.build({
    entryPoints: [filePath],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    jsx: 'automatic',
    tsconfig: hasTsconfig ? tsconfigPath : undefined,
    alias: {
      ...(reactPath && { react: reactPath }),
      ...(reactDomPath && { 'react-dom': reactDomPath }),
    },
    logLevel: 'silent',
  });

  const code = result.outputFiles[0].text;

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'twenty-manifest-'));
  const tempFile = path.join(tempDir, 'module.cjs');

  try {
    await fs.writeFile(tempFile, code);

    return require(tempFile) as Record<string, unknown>;
  } finally {
    await fs.remove(tempDir);
  }
};

const extractConfigFromModule = <T>(
  module: Record<string, unknown>,
): T | undefined => {
  if (isDefined(module.default) && isPlainObject(module.default)) {
    return module.default as T;
  }

  for (const [_, value] of Object.entries(module)) {
    if (isPlainObject(value)) {
      return value as T;
    }
  }

  return undefined;
};
