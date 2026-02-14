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

// Comprehensive list of React exports so that minified third-party code
// (MUI, Chakra, etc.) always resolves every React API from globalThis.React
const REACT_STATIC_EXPORTS = `
export var Children = /* @__PURE__ */ (() => globalThis.React.Children)();
export var Component = /* @__PURE__ */ (() => globalThis.React.Component)();
export var Fragment = /* @__PURE__ */ (() => globalThis.React.Fragment)();
export var Profiler = /* @__PURE__ */ (() => globalThis.React.Profiler)();
export var PureComponent = /* @__PURE__ */ (() => globalThis.React.PureComponent)();
export var StrictMode = /* @__PURE__ */ (() => globalThis.React.StrictMode)();
export var Suspense = /* @__PURE__ */ (() => globalThis.React.Suspense)();
export var cloneElement = /* @__PURE__ */ (() => globalThis.React.cloneElement)();
export var createContext = /* @__PURE__ */ (() => globalThis.React.createContext)();
export var createElement = /* @__PURE__ */ (() => globalThis.React.createElement)();
export var createFactory = /* @__PURE__ */ (() => globalThis.React.createFactory)();
export var createRef = /* @__PURE__ */ (() => globalThis.React.createRef)();
export var forwardRef = /* @__PURE__ */ (() => globalThis.React.forwardRef)();
export var isValidElement = /* @__PURE__ */ (() => globalThis.React.isValidElement)();
export var lazy = /* @__PURE__ */ (() => globalThis.React.lazy)();
export var memo = /* @__PURE__ */ (() => globalThis.React.memo)();
export var startTransition = /* @__PURE__ */ (() => globalThis.React.startTransition)();
export var useCallback = /* @__PURE__ */ (() => globalThis.React.useCallback)();
export var useContext = /* @__PURE__ */ (() => globalThis.React.useContext)();
export var useDebugValue = /* @__PURE__ */ (() => globalThis.React.useDebugValue)();
export var useDeferredValue = /* @__PURE__ */ (() => globalThis.React.useDeferredValue)();
export var useEffect = /* @__PURE__ */ (() => globalThis.React.useEffect)();
export var useId = /* @__PURE__ */ (() => globalThis.React.useId)();
export var useImperativeHandle = /* @__PURE__ */ (() => globalThis.React.useImperativeHandle)();
export var useInsertionEffect = /* @__PURE__ */ (() => globalThis.React.useInsertionEffect)();
export var useLayoutEffect = /* @__PURE__  */ (() => globalThis.React.useLayoutEffect)();
export var useMemo = /* @__PURE__ */ (() => globalThis.React.useMemo)();
export var useReducer = /* @__PURE__ */ (() => globalThis.React.useReducer)();
export var useRef = /* @__PURE__ */ (() => globalThis.React.useRef)();
export var useState = /* @__PURE__ */ (() => globalThis.React.useState)();
export var useSyncExternalStore = /* @__PURE__ */ (() => globalThis.React.useSyncExternalStore)();
export var useTransition = /* @__PURE__ */ (() => globalThis.React.useTransition)();
export var version = /* @__PURE__ */ (() => globalThis.React.version)();
export default /* @__PURE__ */ (() => globalThis.React)();
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
    react: REACT_STATIC_EXPORTS,
    'react/jsx-runtime': JSX_RUNTIME_EXPORTS,
  },
});
