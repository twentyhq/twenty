import type * as esbuild from 'esbuild';

// All value-exports of twenty-sdk/define, classified for stubbing during the
// user-app build. Types are stripped at TS compile time, so they don't appear
// here. Any new value-export added to twenty-sdk/define must be appended below
// (a unit test enforces this stays in sync).
//
// Why we stub:
//   Logic functions and front-components only need `default.config.handler`
//   to exist at runtime. The wrappers (`defineLogicFunction`, etc.) and the
//   enums/helpers re-exported by twenty-sdk/define are build-time concerns
//   used by the manifest extractor, not by the Lambda runtime. Bundling the
//   real implementations drags in zod, @sniptt/guards, twenty-shared and a
//   few hundred KB per logic-function bundle.
const FACTORY_EXPORTS = [
  'createValidationResult',
  'defineAgent',
  'defineApplication',
  'defineField',
  'defineFrontComponent',
  'defineLogicFunction',
  'defineNavigationMenuItem',
  'defineObject',
  'definePageLayout',
  'definePageLayoutTab',
  'definePostInstallLogicFunction',
  'definePreInstallLogicFunction',
  'defineRole',
  'defineSkill',
  'defineView',
] as const;

const ANY_EXPORTS = [
  'AggregateOperations',
  'DateDisplayFormat',
  'FieldMetadataSettingsOnClickAction',
  'FieldType',
  'HTTPMethod',
  'NavigationMenuItemType',
  'NumberDataType',
  'ObjectRecordGroupByDateGranularity',
  'OnDeleteAction',
  'PageLayoutTabLayoutMode',
  'PermissionFlag',
  'RelationType',
  'STANDARD_OBJECT',
  'STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS',
  'ViewFilterGroupLogicalOperator',
  'ViewFilterOperand',
  'ViewKey',
  'ViewOpenRecordIn',
  'ViewSortDirection',
  'ViewType',
  'ViewVisibility',
  'generateDefaultFieldUniversalIdentifier',
  'getPublicAssetUrl',
  'validateFields',
] as const;

export const TWENTY_SDK_DEFINE_STUBBED_EXPORTS = {
  factories: FACTORY_EXPORTS,
  any: ANY_EXPORTS,
} as const;

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

  for (const name of FACTORY_EXPORTS) {
    exportLines.push(`export const ${name} = __defineFactoryStub;`);
  }
  for (const name of ANY_EXPORTS) {
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
