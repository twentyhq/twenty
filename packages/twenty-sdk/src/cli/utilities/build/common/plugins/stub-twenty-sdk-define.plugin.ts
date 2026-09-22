import type * as esbuild from 'esbuild';

import { isPlainObject } from 'twenty-shared/utils';

import * as twentySdkDefine from '@/sdk/define';

// Everything in twenty-sdk/define is build-time metadata for the manifest
// extractor and is dead code in the user-app bundle. Stubbing it drops zod,
// twenty-shared and ~1MB per logic-function bundle.
//
// Exports are derived from `Object.keys(twentySdkDefine)` so new ones land
// in the stub automatically; the unit test snapshots the partition.
// Factories must keep the `(config) => ({ config, ... })` shape so the
// manifest extractor can still read `.config`, and plain data keeps its real
// value since a handler may read it at runtime; anything else can be a Proxy.
export const isDefineFactoryExportName = (name: string): boolean =>
  /^define[A-Z]/.test(name) || name === 'createValidationResult';

const isPrimitive = (value: unknown): boolean =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean';

// An enum or a flat constant map an app can read at runtime, so a Proxy would
// hand it nonsense where it expects the real value.
export const isPlainDataExport = (value: unknown): boolean =>
  isPrimitive(value) ||
  (isPlainObject(value) && Object.values(value).every(isPrimitive));

const partitionDefineExports = (
  mod: Record<string, unknown>,
): {
  factories: readonly string[];
  plainData: readonly string[];
  any: readonly string[];
} => {
  const factories: string[] = [];
  const plainData: string[] = [];
  const any: string[] = [];

  for (const name of Object.keys(mod).sort()) {
    if (isDefineFactoryExportName(name)) {
      factories.push(name);
    } else if (isPlainDataExport(mod[name])) {
      plainData.push(name);
    } else {
      any.push(name);
    }
  }

  return { factories, plainData, any };
};

export const TWENTY_SDK_DEFINE_STUBBED_EXPORTS = partitionDefineExports(
  twentySdkDefine as unknown as Record<string, unknown>,
);

const VIRTUAL_NAMESPACE = 'twenty-sdk-define-stub';
const STUB_RESOLVED_PATH = '__twenty-sdk-define-stub__';

const STUB_PRELUDE = `
// Auto-generated stub for twenty-sdk/define injected by the SDK CLI build.
// Real implementations would pull in zod, twenty-shared and ~1MB of code; at
// runtime only \`default.config.handler\` is consumed, so tiny no-ops suffice.
const __defineFactoryStub = (config) => ({
  success: true,
  config,
  errors: [],
});

const __anyHandler = {
  get(_target, prop) {
    if (prop === '__esModule') return true;
    if (prop === Symbol.toPrimitive) return () => '';
    if (typeof prop === 'symbol') return undefined;
    return new Proxy(() => undefined, __anyHandler);
  },
  apply() {
    return new Proxy(() => undefined, __anyHandler);
  },
};
const __anyStub = new Proxy(() => undefined, __anyHandler);
`;

export const buildStubModuleSource = (): string => {
  const exportLines: string[] = [];

  for (const name of TWENTY_SDK_DEFINE_STUBBED_EXPORTS.factories) {
    exportLines.push(`export const ${name} = __defineFactoryStub;`);
  }
  for (const name of TWENTY_SDK_DEFINE_STUBBED_EXPORTS.plainData) {
    const value = (twentySdkDefine as unknown as Record<string, unknown>)[name];

    exportLines.push(`export const ${name} = ${JSON.stringify(value)};`);
  }
  for (const name of TWENTY_SDK_DEFINE_STUBBED_EXPORTS.any) {
    exportLines.push(`export const ${name} = __anyStub;`);
  }

  return `${STUB_PRELUDE}\n${exportLines.join('\n')}\n`;
};

export const createStubTwentySdkDefinePlugin = (): esbuild.Plugin => ({
  name: 'twenty-sdk-define-stub',
  setup(build) {
    build.onResolve({ filter: /^twenty-sdk\/define$/ }, () => ({
      path: STUB_RESOLVED_PATH,
      namespace: VIRTUAL_NAMESPACE,
    }));

    build.onLoad({ filter: /.*/, namespace: VIRTUAL_NAMESPACE }, () => ({
      contents: buildStubModuleSource(),
      loader: 'js',
    }));
  },
});
