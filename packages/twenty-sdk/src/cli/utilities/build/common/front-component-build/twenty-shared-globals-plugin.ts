import { collectNamedImports } from './utils/collect-named-imports';
import { createGlobalsPlugin } from './utils/create-globals-plugin';

const TWENTY_SHARED_IMPORT_PATTERN =
  /import\s+\{(?<namedImports>[^}]*)\}\s*from\s*['"]twenty-shared(?:\/(?<subPath>[^'"]*?))?['"];?/g;

const TWENTY_SHARED_MODULE_FILTER_PATTERN = /^twenty-shared(\/.*)?$/;

const buildGlobalAccessorExpression = (moduleSubPath: string): string => {
  if (moduleSubPath === '') {
    return 'globalThis.TwentyShared';
  }

  return `globalThis.TwentyShared['${moduleSubPath}']`;
};

export const twentySharedGlobalsPlugin = createGlobalsPlugin({
  pluginName: 'twenty-shared-globals',
  namespace: 'twenty-shared-globals',
  moduleName: 'twenty-shared',
  moduleFilter: TWENTY_SHARED_MODULE_FILTER_PATTERN,
  collectImports: (sourceContent) =>
    collectNamedImports({
      sourceContent,
      pattern: TWENTY_SHARED_IMPORT_PATTERN,
    }),
  generateExports: ({ namedImports, moduleSubPath }) => {
    const globalAccessorExpression =
      buildGlobalAccessorExpression(moduleSubPath);

    return [...namedImports]
      .map(
        (importName) =>
          `export var ${importName} = /* @__PURE__ */ (() => ${globalAccessorExpression}.${importName})();`,
      )
      .join('\n');
  },
});
