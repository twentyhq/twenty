import { isDefined } from 'twenty-shared/utils';

import { collectNamedImports } from './utils/collect-named-imports';
import { createGlobalsPlugin } from './utils/create-globals-plugin';

const REACT_IMPORT_PATTERN =
  /import\s+(?:(?<defaultImport>\w+)\s*,?\s*)?(?:\{(?<namedImports>[^}]*)\})?\s*from\s*['"]react['"];?/g;

const REACT_STAR_IMPORT_PATTERN =
  /import\s+\*\s+as\s+(?<namespaceName>\w+)\s+from\s*['"]react['"];?/g;

const REACT_MODULE_FILTER_PATTERN = /^react(\/jsx-runtime)?$/;

const JSX_RUNTIME_EXPORTS = `
export var jsx = /* @__PURE__ */ (() => globalThis.jsx)();
export var jsxs = /* @__PURE__ */ (() => globalThis.jsxs)();
export var Fragment = /* @__PURE__ */ (() => globalThis.React.Fragment)();
`.trim();

// Scans source for `namespaceName.property` accesses (e.g. React.createElement)
const collectNamespacePropertyUsages = (
  sourceContent: string,
  namespaceName: string,
): Set<string> => {
  const propertyAccessPattern = new RegExp(
    `\\b${namespaceName}\\s*\\.\\s*(\\w+)`,
    'g',
  );
  const usages = new Set<string>();

  let usageMatch;

  while (isDefined((usageMatch = propertyAccessPattern.exec(sourceContent)))) {
    usages.add(usageMatch[1]);
  }

  return usages;
};

const collectReactImports = (
  sourceContent: string,
): Map<string, Set<string>> => {
  const namedImports = collectNamedImports({
    sourceContent,
    pattern: REACT_IMPORT_PATTERN,
  });

  let importMatch;

  while (isDefined((importMatch = REACT_IMPORT_PATTERN.exec(sourceContent)))) {
    const defaultImportName = importMatch.groups?.defaultImport;

    if (defaultImportName) {
      if (!namedImports.has('')) {
        namedImports.set('', new Set());
      }

      namedImports.get('')!.add('default');
    }
  }

  REACT_IMPORT_PATTERN.lastIndex = 0;

  // Handle `import * as X from 'react'` — scan for X.property usages
  // and export each as a named export so the namespace object has them
  let starMatch;

  while (
    isDefined((starMatch = REACT_STAR_IMPORT_PATTERN.exec(sourceContent)))
  ) {
    const namespaceName = starMatch.groups?.namespaceName;

    if (namespaceName) {
      if (!namedImports.has('')) {
        namedImports.set('', new Set());
      }

      namedImports.get('')!.add('default');

      const propertyUsages = collectNamespacePropertyUsages(
        sourceContent,
        namespaceName,
      );

      for (const propertyName of propertyUsages) {
        namedImports.get('')!.add(propertyName);
      }
    }
  }

  REACT_STAR_IMPORT_PATTERN.lastIndex = 0;

  return namedImports;
};

const generateReactExports = ({
  namedImports,
}: {
  namedImports: Set<string>;
}): string => {
  const exportLines: string[] = [];

  for (const reactImportName of namedImports) {
    if (reactImportName === 'default') {
      exportLines.push(
        'export default /* @__PURE__ */ (() => globalThis.React)();',
      );
    } else {
      exportLines.push(
        `export var ${reactImportName} = /* @__PURE__ */ (() => globalThis.React.${reactImportName})();`,
      );
    }
  }

  return exportLines.join('\n');
};

export const reactGlobalsPlugin = createGlobalsPlugin({
  pluginName: 'react-globals',
  namespace: 'react-globals',
  moduleName: 'react',
  moduleFilter: REACT_MODULE_FILTER_PATTERN,
  collectImports: collectReactImports,
  generateExports: generateReactExports,
  staticContents: {
    'react/jsx-runtime': JSX_RUNTIME_EXPORTS,
  },
});
