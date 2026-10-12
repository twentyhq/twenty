import type * as esbuild from 'esbuild';

import { isPlainObject } from 'twenty-shared/utils';

import { createRequire } from 'node:module';
import { join } from 'node:path';

export const isDefineFactoryExportName = (name: string): boolean =>
  /^define[A-Z]/.test(name) || name === 'createValidationResult';

const isPrimitive = (value: unknown): boolean =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean';

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

const VIRTUAL_NAMESPACE = 'twenty-sdk-define-stub';
const STUB_RESOLVED_PATH = '__twenty-sdk-define-stub__';

const STUB_PRELUDE = `
// Auto-generated stub for twenty-sdk/define injected by the Twenty CLI.
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

export const buildStubModuleSource = (
  twentySdkDefine: Record<string, unknown>,
): string => {
  const stubbedExports = partitionDefineExports(twentySdkDefine);
  const exportLines: string[] = [];

  for (const name of stubbedExports.factories) {
    exportLines.push(`export const ${name} = __defineFactoryStub;`);
  }
  for (const name of stubbedExports.plainData) {
    const value = twentySdkDefine[name];

    exportLines.push(`export const ${name} = ${JSON.stringify(value)};`);
  }
  for (const name of stubbedExports.any) {
    exportLines.push(`export const ${name} = __anyStub;`);
  }

  return `${STUB_PRELUDE}\n${exportLines.join('\n')}\n`;
};

export const createStubTwentySdkDefinePlugin = (
  appPath: string,
): esbuild.Plugin => ({
  name: 'twenty-sdk-define-stub',
  setup(build) {
    build.onResolve({ filter: /^twenty-sdk\/define$/ }, () => ({
      path: STUB_RESOLVED_PATH,
      namespace: VIRTUAL_NAMESPACE,
    }));

    build.onLoad({ filter: /.*/, namespace: VIRTUAL_NAMESPACE }, () => ({
      contents: buildStubModuleSource(
        createRequire(join(appPath, 'package.json'))('twenty-sdk/define'),
      ),
      loader: 'js',
    }));
  },
});
