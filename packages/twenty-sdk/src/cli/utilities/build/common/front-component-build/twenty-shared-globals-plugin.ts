import { isDefined } from 'twenty-shared/utils';

import { createGlobalsPlugin } from './utils/create-globals-plugin';
import { extractNamesFromImportSpecifier } from './utils/extract-names-from-import-specifier';

const TWENTY_SHARED_IMPORT_PATTERN =
  /import\s+\{([^}]*)\}\s*from\s*['"]twenty-shared(?:\/([^'"]*?))?['"];?/g;

const TWENTY_SHARED_MODULE_FILTER_PATTERN = /^twenty-shared(\/.*)?$/;

const collectTwentySharedImports = (
  sourceContent: string,
): Map<string, Set<string>> => {
  const collectedImports = new Map<string, Set<string>>();

  let importMatch;

  while (
    isDefined((importMatch = TWENTY_SHARED_IMPORT_PATTERN.exec(sourceContent)))
  ) {
    const namedImportsString = importMatch[1];
    const subPath = importMatch[2] ?? '';

    if (!collectedImports.has(subPath)) {
      collectedImports.set(subPath, new Set());
    }

    if (namedImportsString) {
      namedImportsString
        .split(',')
        .filter(
          (importSpecifier) =>
            importSpecifier.trim() &&
            !importSpecifier.trim().startsWith('type '),
        )
        .forEach((importSpecifier) => {
          const { originalName } =
            extractNamesFromImportSpecifier(importSpecifier);

          collectedImports.get(subPath)!.add(originalName);
        });
    }
  }

  TWENTY_SHARED_IMPORT_PATTERN.lastIndex = 0;

  return collectedImports;
};

const getGlobalPath = (subPath: string): string => {
  if (subPath === '') {
    return 'globalThis.TwentyShared';
  }

  return `globalThis.TwentyShared['${subPath}']`;
};

const generateTwentySharedExports = (
  imports: Set<string>,
  subPath: string,
): string => {
  const globalPath = getGlobalPath(subPath);
  const exportStatements: string[] = [];

  for (const importName of imports) {
    exportStatements.push(
      `export var ${importName} = ${globalPath}.${importName};`,
    );
  }

  return exportStatements.join('\n');
};

export const twentySharedGlobalsPlugin = createGlobalsPlugin({
  name: 'twenty-shared-globals',
  namespace: 'twenty-shared-globals',
  moduleName: 'twenty-shared',
  moduleFilter: TWENTY_SHARED_MODULE_FILTER_PATTERN,
  collectImports: collectTwentySharedImports,
  generateExports: generateTwentySharedExports,
});
