import * as fs from 'fs/promises';

import type * as esbuild from 'esbuild';

import { isDefined } from 'twenty-shared/utils';
import { JSX_RUNTIME_EXPORTS } from './constants/JsxRuntimeExports';
import { REACT_IMPORT_PATTERN } from './constants/ReactImportPattern';
import { REACT_MODULE_FILTER_PATTERN } from './constants/ReactModuleFilterPattern';
import { extractNamesFromImportSpecifier } from './utils/extract-names-from-import-specifier';

const collectReactImports = (sourceContent: string): Set<string> => {
  const collectedReactImports = new Set<string>();

  let importMatch;

  while (isDefined((importMatch = REACT_IMPORT_PATTERN.exec(sourceContent)))) {
    const defaultImportName = importMatch[1];
    const namedImportsString = importMatch[2];

    if (defaultImportName) {
      collectedReactImports.add('default');
    }

    if (namedImportsString) {
      namedImportsString
        .split(',')
        .filter((importSpecifier) => importSpecifier.trim())
        .forEach((importSpecifier) => {
          const { originalName } =
            extractNamesFromImportSpecifier(importSpecifier);

          collectedReactImports.add(originalName);
        });
    }
  }

  REACT_IMPORT_PATTERN.lastIndex = 0;

  return collectedReactImports;
};

const generateReactExports = (reactImports: Set<string>): string => {
  const exportStatements: string[] = [];

  for (const reactImportName of reactImports) {
    if (reactImportName === 'default') {
      exportStatements.push('export default globalThis.React;');
    } else {
      exportStatements.push(
        `export var ${reactImportName} = globalThis.React.${reactImportName};`,
      );
    }
  }

  return exportStatements.join('\n');
};

export const reactGlobalsPlugin: esbuild.Plugin = {
  name: 'react-globals',
  setup: async (build) => {
    const reactImportsByFilePath = new Map<string, Set<string>>();

    build.onStart(() => {
      reactImportsByFilePath.clear();
    });

    build.onResolve(
      { filter: REACT_MODULE_FILTER_PATTERN },
      async ({ importer, path }) => {
        if (importer && !reactImportsByFilePath.has(importer)) {
          try {
            const sourceFileContent = await fs.readFile(importer, 'utf-8');

            reactImportsByFilePath.set(
              importer,
              collectReactImports(sourceFileContent),
            );
          } catch {
            reactImportsByFilePath.set(importer, new Set());
          }
        }

        return {
          path,
          namespace: 'react-globals',
          pluginData: { importer },
        };
      },
    );

    build.onLoad(
      { filter: /.*/, namespace: 'react-globals' },
      ({ pluginData, path }) => {
        const importerFilePath = pluginData?.importer || '';
        const collectedReactImports =
          reactImportsByFilePath.get(importerFilePath) || new Set<string>();

        if (path === 'react/jsx-runtime') {
          return {
            contents: JSX_RUNTIME_EXPORTS,
            loader: 'js',
          };
        }

        if (path === 'react') {
          return {
            contents: generateReactExports(collectedReactImports),
            loader: 'js',
          };
        }

        return null;
      },
    );
  },
};
