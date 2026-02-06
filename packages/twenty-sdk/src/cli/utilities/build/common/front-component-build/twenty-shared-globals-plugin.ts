import * as fs from 'fs/promises';

import type * as esbuild from 'esbuild';

import { isDefined } from 'twenty-shared/utils';
import { extractNamesFromImportSpecifier } from './utils/extract-names-from-import-specifier';

const TWENTY_SHARED_IMPORT_PATTERN =
  /import\s+\{([^}]*)\}\s*from\s*['"]twenty-shared(?:\/([^'"]*?))?['"];?/g;

const TWENTY_SHARED_MODULE_FILTER_PATTERN = /^twenty-shared(\/.*)?$/;

type TwentySharedImportsMap = Map<string, Set<string>>;

const collectTwentySharedImports = (
  sourceContent: string,
): TwentySharedImportsMap => {
  const collectedImports: TwentySharedImportsMap = new Map();

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

export const twentySharedGlobalsPlugin: esbuild.Plugin = {
  name: 'twenty-shared-globals',
  setup: async (build) => {
    const twentySharedImportsByFilePath = new Map<
      string,
      TwentySharedImportsMap
    >();

    build.onStart(() => {
      twentySharedImportsByFilePath.clear();
    });

    build.onResolve(
      { filter: TWENTY_SHARED_MODULE_FILTER_PATTERN },
      async ({ importer, path }) => {
        if (importer && !twentySharedImportsByFilePath.has(importer)) {
          try {
            const sourceFileContent = await fs.readFile(importer, 'utf-8');
            twentySharedImportsByFilePath.set(
              importer,
              collectTwentySharedImports(sourceFileContent),
            );
          } catch {
            twentySharedImportsByFilePath.set(importer, new Map());
          }
        }

        return {
          path: importer
            ? `${path}?importer=${encodeURIComponent(importer)}`
            : path,
          namespace: 'twenty-shared-globals',
          pluginData: { importer, originalPath: path },
        };
      },
    );

    build.onLoad(
      { filter: /.*/, namespace: 'twenty-shared-globals' },
      ({ pluginData }) => {
        const importerFilePath = pluginData?.importer || '';
        const originalPath: string = pluginData?.originalPath || '';

        const subPath =
          originalPath === 'twenty-shared'
            ? ''
            : originalPath.replace('twenty-shared/', '');

        const fileImports = twentySharedImportsByFilePath.get(importerFilePath);
        const subPathImports = fileImports?.get(subPath) ?? new Set<string>();

        return {
          contents: generateTwentySharedExports(subPathImports, subPath),
          loader: 'js' as const,
        };
      },
    );
  },
};
