import * as fs from 'fs/promises';

import type * as esbuild from 'esbuild';

import { isDefined } from 'twenty-shared/utils';
import { extractNamesFromImportSpecifier } from './utils/extract-names-from-import-specifier';

const REACT_IMPORT_PATTERN =
  /import\s+(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*['"]react['"];?/g;

const REACT_MODULE_FILTER_PATTERN = /^react(\/jsx-runtime)?$/;

const JSX_RUNTIME_EXPORTS = `
export var jsx = globalThis.jsx;
export var jsxs = globalThis.jsxs;
export var Fragment = globalThis.React.Fragment;
`.trim();

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
            reactImportsByFilePath.set(importer, new Set<string>());
          }
        }

        return {
          path:
            path === 'react' && importer
              ? `react?importer=${encodeURIComponent(importer)}`
              : path,
          namespace: 'react-globals',
          pluginData: { importer },
        };
      },
    );

    build.onLoad(
      { filter: /.*/, namespace: 'react-globals' },
      ({ path, pluginData }) => {
        if (path === 'react/jsx-runtime') {
          return {
            contents: JSX_RUNTIME_EXPORTS,
            loader: 'js',
          };
        }

        if (path === 'react' || path.startsWith('react?importer=')) {
          const importerFilePath =
            pluginData?.importer ||
            decodeURIComponent(path.split('react?importer=')[1] || '');
          const collectedReactImports =
            reactImportsByFilePath.get(importerFilePath) || new Set<string>();

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
