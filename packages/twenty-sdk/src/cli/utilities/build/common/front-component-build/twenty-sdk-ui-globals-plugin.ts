import { collectNamedImports } from './utils/collect-named-imports';
import { createGlobalsPlugin } from './utils/create-globals-plugin';

const TWENTY_SDK_UI_IMPORT_PATTERN =
  /import\s+\{(?<namedImports>[^}]*)\}\s*from\s*['"]twenty-sdk\/ui['"];?/g;

const TWENTY_SDK_UI_MODULE_FILTER_PATTERN = /^twenty-sdk\/ui$/;

export const twentySdkUiGlobalsPlugin = createGlobalsPlugin({
  pluginName: 'twenty-sdk-ui-globals',
  namespace: 'twenty-sdk-ui-globals',
  moduleName: 'twenty-sdk/ui',
  moduleFilter: TWENTY_SDK_UI_MODULE_FILTER_PATTERN,
  collectImports: (sourceContent) =>
    collectNamedImports({
      sourceContent,
      pattern: TWENTY_SDK_UI_IMPORT_PATTERN,
    }),
  generateExports: ({ namedImports }) =>
    [...namedImports]
      .map(
        (importName) =>
          `export var ${importName} = /* @__PURE__ */ (() => globalThis.RemoteComponents.TwentyUi${importName})();`,
      )
      .join('\n'),
});
