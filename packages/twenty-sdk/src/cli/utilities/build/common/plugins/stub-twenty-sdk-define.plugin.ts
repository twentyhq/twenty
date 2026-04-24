import type * as esbuild from 'esbuild';

import * as twentySdkDefine from '@/sdk/define';

// Why we stub:
//   Logic functions and front-components only need `default.config.handler`
//   to exist at runtime. The wrappers (`defineLogicFunction`, etc.) and the
//   enums/helpers re-exported by twenty-sdk/define are build-time concerns
//   used by the manifest extractor, not by the Lambda runtime. Bundling the
//   real implementations drags in zod, @sniptt/guards, twenty-shared and a
//   few hundred KB per logic-function bundle.
//
// We do NOT hand-maintain a list of exports: it is derived at CLI startup
// from `Object.keys(twentySdkDefine)`. Adding a new export to
// `twenty-sdk/define` automatically lands in the stub. A unit test pins the
// classification to keep behaviour predictable and surface unexpected new
// exports in PRs (snapshot diff).

// Factory exports preserve `(config) => ({ success: true, config, errors })`
// because the manifest extractor reads `.config` off the call return value.
// Anything else can be a no-op Proxy: enums for type-only branding,
// pure helpers (e.g. `validateFields`) that aren't reachable at Lambda
// runtime, and re-exported constants (e.g. `STANDARD_OBJECT`) used only
// during manifest validation.
export const isDefineFactoryExportName = (name: string): boolean =>
  /^define[A-Z]/.test(name) || name === 'createValidationResult';

const partitionDefineExports = (
  mod: Record<string, unknown>,
): { factories: readonly string[]; any: readonly string[] } => {
  const factories: string[] = [];
  const any: string[] = [];

  for (const name of Object.keys(mod).sort()) {
    if (isDefineFactoryExportName(name)) {
      factories.push(name);
    } else {
      any.push(name);
    }
  }

  return { factories, any };
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

const buildStubModuleSource = (): string => {
  const exportLines: string[] = [];

  for (const name of TWENTY_SDK_DEFINE_STUBBED_EXPORTS.factories) {
    exportLines.push(`export const ${name} = __defineFactoryStub;`);
  }
  for (const name of TWENTY_SDK_DEFINE_STUBBED_EXPORTS.any) {
    exportLines.push(`export const ${name} = __anyStub;`);
  }

  return `${STUB_PRELUDE}\n${exportLines.join('\n')}\n`;
};

// Returns an esbuild plugin that intercepts every `twenty-sdk/define` import
// in user-app sources and replaces it with a tiny virtual module. Logic
// functions and front-components keep importing `defineLogicFunction`,
// `defineFrontComponent`, `FieldType`, etc. from `twenty-sdk/define` for
// manifest extraction purposes; at bundle time those imports become no-ops
// instead of pulling in the real (heavy) module.
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
