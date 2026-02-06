import { isDefined } from 'twenty-shared/utils';

import { collectNamedImports } from './utils/collect-named-imports';
import { createGlobalsPlugin } from './utils/create-globals-plugin';

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
  const namedImports = collectNamedImports(sourceContent, {
    pattern: REACT_IMPORT_PATTERN,
    namedImportsCaptureGroup: 2,
  });

  let importMatch;

  while (isDefined((importMatch = REACT_IMPORT_PATTERN.exec(sourceContent)))) {
    const defaultImportName = importMatch[1];

    if (defaultImportName) {
      if (!namedImports.has('')) {
        namedImports.set('', new Set());
      }

      namedImports.get('')!.add('default');
    }
  }

  REACT_IMPORT_PATTERN.lastIndex = 0;

  return namedImports;
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
