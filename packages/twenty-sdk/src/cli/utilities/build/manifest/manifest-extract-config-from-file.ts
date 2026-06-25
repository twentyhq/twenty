import { conditionalAvailabilityTransformPlugin } from '@/cli/utilities/build/common/conditional-availability/conditional-availability-transform-plugin';
import { pathExists } from '@/cli/utilities/file/fs-utils';
import { type ValidationResult } from '@/sdk/define';
import * as esbuild from 'esbuild';
import { createRequire } from 'module';
import vm from 'node:vm';
import path from 'path';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

// Signature of the function produced by vm.compileFunction, matching Node's
// CommonJS module wrapper parameters.
type CompiledModuleWrapper = (
  exports: Record<string, unknown>,
  require: NodeRequire,
  module: { exports: Record<string, unknown> },
  filename: string,
  dirname: string,
) => void;

const MANIFEST_MOCK_MODULES = [
  'twenty-sdk/ui',
  'twenty-client-sdk/core',
  'twenty-client-sdk/metadata',
];

const manifestMockPlugin: esbuild.Plugin = {
  name: 'manifest-mock',
  setup: (build) => {
    const filter = new RegExp(
      `^(${MANIFEST_MOCK_MODULES.map((module) => module.replace('/', '\\/')).join('|')})$`,
    );

    build.onResolve({ filter }, ({ path: modulePath }) => ({
      path: modulePath,
      namespace: 'manifest-mock',
    }));

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
    alias: {
      ...(reactPath && { react: reactPath }),
      ...(reactDomPath && { 'react-dom': reactDomPath }),
    },
    plugins: [conditionalAvailabilityTransformPlugin, manifestMockPlugin],
    logLevel: 'silent',
  });

  const code = result.outputFiles[0].text;

  // Evaluate the bundled CJS in memory instead of writing it to disk and routing
  // it through Node's global require cache. esbuild runs with `bundle: true`, so
  // the output is self-contained (only Node builtins remain as `require` calls):
  // there is nothing to leak because `vm.compileFunction` never populates
  // `Module._cache`, so memory stays bounded across dev-mode rebuilds. As a bonus,
  // stack traces point at the real source file rather than a random temp path.
  const compiledWrapper = vm.compileFunction(
    code,
    ['exports', 'require', 'module', '__filename', '__dirname'],
    { filename: filePath },
  ) as unknown as CompiledModuleWrapper;

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
