import { collectNamedImports } from './utils/collect-named-imports';
import { createGlobalsPlugin } from './utils/create-globals-plugin';

const TWENTY_SDK_IMPORT_PATTERN =
  /import\s+(?:\{(?<namedImports>[^}]*)\})?\s*from\s*['"]twenty-sdk['"];?/g;

const TWENTY_SDK_MODULE_FILTER_PATTERN = /^twenty-sdk$/;

export const twentySdkGlobalsPlugin = createGlobalsPlugin({
  pluginName: 'twenty-sdk-globals',
  namespace: 'twenty-sdk-globals',
  moduleName: 'twenty-sdk',
  moduleFilter: TWENTY_SDK_MODULE_FILTER_PATTERN,
  collectImports: (sourceContent) =>
    collectNamedImports({
      sourceContent,
      pattern: TWENTY_SDK_IMPORT_PATTERN,
    }),
  generateExports: ({ namedImports }) =>
    [...namedImports]
      .map(
        (importName) =>
          `export var ${importName} = /* @__PURE__ */ (() => globalThis.TwentySdk.${importName})();`,
      )
      .join('\n'),
});
