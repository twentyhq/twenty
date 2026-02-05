import * as fs from 'fs/promises';

import type * as esbuild from 'esbuild';

import { isDefined } from 'twenty-shared/utils';
import { extractNamesFromImportSpecifier } from './utils/extract-names-from-import-specifier';

const TWENTY_SDK_IMPORT_PATTERN =
  /import\s+(?:\{([^}]*)\})?\s*from\s*['"]twenty-sdk['"];?/g;

const TWENTY_SDK_MODULE_FILTER_PATTERN = /^twenty-sdk$/;

const TWENTY_SDK_GLOBALS = new Set([
  'navigate',
  'useUserId',
  'useFrontComponentExecutionContext',
]);

const collectTwentySdkImports = (sourceContent: string): Set<string> => {
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

  return collectedImports;
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

export const twentySdkGlobalsPlugin: esbuild.Plugin = {
  name: 'twenty-sdk-globals',
  setup: async (build) => {
    const twentySdkImportsByFilePath = new Map<string, Set<string>>();

    build.onStart(() => {
      twentySdkImportsByFilePath.clear();
    });

    build.onResolve(
      { filter: TWENTY_SDK_MODULE_FILTER_PATTERN },
      async ({ importer, path }) => {
        if (importer && !twentySdkImportsByFilePath.has(importer)) {
          try {
            const sourceFileContent = await fs.readFile(importer, 'utf-8');
            twentySdkImportsByFilePath.set(
              importer,
              collectTwentySdkImports(sourceFileContent),
            );
          } catch {
            twentySdkImportsByFilePath.set(importer, new Set<string>());
          }
        }

        return {
          path:
            path === 'twenty-sdk' && importer
              ? `twenty-sdk?importer=${encodeURIComponent(importer)}`
              : path,
          namespace: 'twenty-sdk-globals',
          pluginData: { importer },
        };
      },
    );

    build.onLoad(
      { filter: /.*/, namespace: 'twenty-sdk-globals' },
      ({ path, pluginData }) => {
        if (path === 'twenty-sdk' || path.startsWith('twenty-sdk?importer=')) {
          const importerFilePath =
            pluginData?.importer ||
            decodeURIComponent(path.split('twenty-sdk?importer=')[1] || '');
          const collectedImports =
            twentySdkImportsByFilePath.get(importerFilePath) ||
            new Set<string>();

          return {
            contents: generateTwentySdkExports(collectedImports),
            loader: 'js',
          };
        }

        return null;
      },
    );
  },
};
