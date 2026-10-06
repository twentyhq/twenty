import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';

import { isArray, isBoolean, isString } from '@sniptt/guards';
import * as esbuild from 'esbuild';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { conditionalAvailabilityTransformPlugin } from '@/app/source/conditional-availability-transform-plugin';
import { type SourceValidationResult } from '@/app/source/types/source-validation-result.type';
import { getWatchInputPlugins } from '@/app/dev/collect-watch-inputs';
import { pathExists } from '@/app/fs-utils';
import { CliError } from '@/output/cli-error';

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

export const extractManifestFromFile = async <
  TConfig = Record<string, unknown>,
>({
  filePath,
  appPath,
}: {
  filePath: string;
  appPath: string;
}): Promise<SourceValidationResult<TConfig>> => {
  const module = await loadModule({ filePath, appPath });

  return extractDefaultConfigFromModuleOrThrow(
    module,
    filePath,
  ) as SourceValidationResult<TConfig>;
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

  const appRequire = createRequire(path.join(appPath, 'package.json'));
  let reactPath: string | undefined;
  let reactDomPath: string | undefined;

  try {
    reactPath = path.dirname(appRequire.resolve('react/package.json'));
    reactDomPath = path.dirname(appRequire.resolve('react-dom/package.json'));
  } catch {}

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
    plugins: [
      ...getWatchInputPlugins(),
      conditionalAvailabilityTransformPlugin,
      manifestMockPlugin,
    ],
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

const extractDefaultConfigFromModuleOrThrow = (
  module: Record<string, unknown>,
  filePath: string,
): SourceValidationResult => {
  const result = module.default;

  if (
    isPlainObject(result) &&
    isBoolean(result.success) &&
    isPlainObject(result.config) &&
    isArray(result.errors) &&
    result.errors.every(isString) &&
    (!isDefined(result.warnings) ||
      (isArray(result.warnings) && result.warnings.every(isString)))
  ) {
    return {
      success: result.success,
      config: result.config,
      errors: result.errors,
      ...(isDefined(result.warnings) ? { warnings: result.warnings } : {}),
    };
  }

  throw new CliError({
    code: 'SDK_SOURCE_UNSUPPORTED',
    message: `The definition in ${filePath} must export a twenty-sdk ValidationResult with success, config and errors.`,
    hint: 'Use the SDK define functions, rename local helpers with the same names, or install a compatible twenty-sdk version.',
  });
};
