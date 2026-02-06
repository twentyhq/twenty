import { collectNamedImports } from './utils/collect-named-imports';
import { createGlobalsPlugin } from './utils/create-globals-plugin';

const TWENTY_SDK_IMPORT_PATTERN =
  /import\s+(?:\{([^}]*)\})?\s*from\s*['"]twenty-sdk['"];?/g;

const TWENTY_SDK_MODULE_FILTER_PATTERN = /^twenty-sdk$/;

export const twentySdkGlobalsPlugin = createGlobalsPlugin({
  name: 'twenty-sdk-globals',
  namespace: 'twenty-sdk-globals',
  moduleName: 'twenty-sdk',
  moduleFilter: TWENTY_SDK_MODULE_FILTER_PATTERN,
  collectImports: (sourceContent) =>
    collectNamedImports(sourceContent, {
      pattern: TWENTY_SDK_IMPORT_PATTERN,
      namedImportsCaptureGroup: 1,
    }),
  generateExports: (imports) =>
    [...imports]
      .map((name) => `export var ${name} = globalThis.TwentySdk.${name};`)
      .join('\n'),
});
