import { isDefined } from 'twenty-shared/utils';

import { createGlobalsPlugin } from './utils/create-globals-plugin';
import { extractNamesFromImportSpecifier } from './utils/extract-names-from-import-specifier';

const TWENTY_SDK_IMPORT_PATTERN =
  /import\s+(?:\{([^}]*)\})?\s*from\s*['"]twenty-sdk['"];?/g;

const TWENTY_SDK_MODULE_FILTER_PATTERN = /^twenty-sdk$/;

const TWENTY_SDK_GLOBALS = new Set([
  'navigate',
  'useUserId',
  'useFrontComponentExecutionContext',
]);

const collectTwentySdkImports = (
  sourceContent: string,
): Map<string, Set<string>> => {
  const collectedImports = new Set<string>();

  let importMatch;

  while (
    isDefined((importMatch = TWENTY_SDK_IMPORT_PATTERN.exec(sourceContent)))
  ) {
    const namedImportsString = importMatch[1];

    if (namedImportsString) {
      namedImportsString
        .split(',')
        .filter((importSpecifier) => importSpecifier.trim())
        .forEach((importSpecifier) => {
          const { originalName } =
            extractNamesFromImportSpecifier(importSpecifier);

          if (TWENTY_SDK_GLOBALS.has(originalName)) {
            collectedImports.add(originalName);
          }
        });
    }
  }

  TWENTY_SDK_IMPORT_PATTERN.lastIndex = 0;

  return new Map([['', collectedImports]]);
};

const generateTwentySdkExports = (imports: Set<string>): string => {
  const exportStatements: string[] = [];

  for (const importName of imports) {
    exportStatements.push(
      `export var ${importName} = globalThis.${importName};`,
    );
  }

  return exportStatements.join('\n');
};

export const twentySdkGlobalsPlugin = createGlobalsPlugin({
  name: 'twenty-sdk-globals',
  namespace: 'twenty-sdk-globals',
  moduleName: 'twenty-sdk',
  moduleFilter: TWENTY_SDK_MODULE_FILTER_PATTERN,
  collectImports: collectTwentySdkImports,
  generateExports: generateTwentySdkExports,
});
