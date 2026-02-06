import { isDefined } from 'twenty-shared/utils';

import { createGlobalsPlugin } from './utils/create-globals-plugin';
import { extractNamesFromImportSpecifier } from './utils/extract-names-from-import-specifier';

const REACT_IMPORT_PATTERN =
  /import\s+(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*['"]react['"];?/g;

const REACT_MODULE_FILTER_PATTERN = /^react(\/jsx-runtime)?$/;

const JSX_RUNTIME_EXPORTS = `
export var jsx = globalThis.jsx;
export var jsxs = globalThis.jsxs;
export var Fragment = globalThis.React.Fragment;
`.trim();

const collectReactImports = (
  sourceContent: string,
): Map<string, Set<string>> => {
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
        .filter(
          (importSpecifier) =>
            importSpecifier.trim() &&
            !importSpecifier.trim().startsWith('type '),
        )
        .forEach((importSpecifier) => {
          const { originalName } =
            extractNamesFromImportSpecifier(importSpecifier);

          collectedReactImports.add(originalName);
        });
    }
  }

  REACT_IMPORT_PATTERN.lastIndex = 0;

  return new Map([['', collectedReactImports]]);
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

export const reactGlobalsPlugin = createGlobalsPlugin({
  name: 'react-globals',
  namespace: 'react-globals',
  moduleName: 'react',
  moduleFilter: REACT_MODULE_FILTER_PATTERN,
  collectImports: collectReactImports,
  generateExports: generateReactExports,
  staticContents: {
    'react/jsx-runtime': JSX_RUNTIME_EXPORTS,
  },
});
