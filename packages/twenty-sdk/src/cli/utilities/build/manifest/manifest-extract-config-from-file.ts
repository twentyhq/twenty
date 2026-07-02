import { conditionalAvailabilityTransformPlugin } from '@/cli/utilities/build/common/conditional-availability/conditional-availability-transform-plugin';
import { pathExists } from '@/cli/utilities/file/fs-utils';
import { type ValidationResult } from '@/sdk/define';
import { createHash } from 'node:crypto';
import * as esbuild from 'esbuild';
import { createRequire } from 'module';
import vm from 'node:vm';
import path from 'path';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

type CompiledModuleWrapper = (
  exports: Record<string, unknown>,
  require: NodeRequire,
  module: { exports: Record<string, unknown> },
  filename: string,
  dirname: string,
) => void;

type CachedCompiledModule = {
  outputHash: string;
  wrapper: CompiledModuleWrapper;
};

// vm.compileFunction pins every function it compiles at the V8 isolate level
// and never releases it (nodejs/node#35375). In dev mode the manifest is
// rebuilt on every file change and recompiles every entity file, so compiling
// the same file over and over grows the heap without bound and eventually
// OOM-crashes the process.
//
// We keep only the latest build per file, keyed by file path: when a file is
// rebuilt with unchanged output we reuse its wrapper, and when its output
// changes we overwrite the entry so the previous build is dropped instead of
// accumulating. This bounds the cache to one entry per file rather than one
// per rebuild.
const compiledModuleCacheByFilePath = new Map<string, CachedCompiledModule>();

const getCompiledWrapper = (
  code: string,
  filePath: string,
): CompiledModuleWrapper => {
  const outputHash = createHash('sha1').update(code).digest('hex');

  const cachedModule = compiledModuleCacheByFilePath.get(filePath);

  if (isDefined(cachedModule) && cachedModule.outputHash === outputHash) {
    return cachedModule.wrapper;
  }

  const compiledWrapper = vm.compileFunction(
    code,
    ['exports', 'require', 'module', '__filename', '__dirname'],
    { filename: filePath },
  ) as unknown as CompiledModuleWrapper;

  compiledModuleCacheByFilePath.set(filePath, {
    outputHash,
    wrapper: compiledWrapper,
  });

  return compiledWrapper;
};

const MANIFEST_MOCK_MODULES = [
  'twenty-ui',
  'twenty-client-sdk/core',
  'twenty-client-sdk/metadata',
];

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const manifestMockPlugin: esbuild.Plugin = {
  name: 'manifest-mock',
  setup: (build) => {
    const escapedModules = MANIFEST_MOCK_MODULES.map(escapeRegExp);
    const filter = new RegExp(`^(${escapedModules.join('|')})(/.*)?$`);

    build.onResolve({ filter }, ({ path: modulePath }) => {
      if (modulePath.endsWith('.css')) {
        return null;
      }

      return {
        path: modulePath,
        namespace: 'manifest-mock',
      };
    });

    build.onLoad({ filter: /.*/, namespace: 'manifest-mock' }, () => ({
      contents: 'module.exports = new Proxy({}, { get: () => () => {} });',
      loader: 'js',
    }));
  },
};

export const extractManifestFromFile = async <T>({
  filePath,
  appPath,
}: {
  filePath: string;
  appPath: string;
}): Promise<ValidationResult<T>> => {
  const module = await loadModule({ filePath, appPath });

  return extractDefaultConfigFromModuleOrThrow<T>(module, filePath);
};

const loadModule = async ({
  filePath,
  appPath,
}: {
  filePath: string;
  appPath: string;
}): Promise<Record<string, unknown>> => {
  const tsconfigPath = path.join(appPath, 'tsconfig.json');
  const hasTsconfig = await pathExists(tsconfigPath);

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
    loader: { '.css': 'empty' },
    alias: {
      ...(reactPath && { react: reactPath }),
      ...(reactDomPath && { 'react-dom': reactDomPath }),
    },
    plugins: [conditionalAvailabilityTransformPlugin, manifestMockPlugin],
    logLevel: 'silent',
  });

  const code = result.outputFiles[0].text;

  const compiledWrapper = getCompiledWrapper(code, filePath);

  const moduleShim: { exports: Record<string, unknown> } = { exports: {} };

  compiledWrapper(
    moduleShim.exports,
    appRequire,
    moduleShim,
    filePath,
    path.dirname(filePath),
  );

  return moduleShim.exports;
};

const extractDefaultConfigFromModuleOrThrow = <T>(
  module: Record<string, unknown>,
  filePath: string,
): ValidationResult<T> => {
  if (isDefined(module.default) && isPlainObject(module.default)) {
    return module.default as ValidationResult<T>;
  }

  throw new Error(
    `Config file ${filePath} must export a config object default export`,
  );
};
