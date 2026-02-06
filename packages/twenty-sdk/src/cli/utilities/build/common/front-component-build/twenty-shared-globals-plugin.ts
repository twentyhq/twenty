import { collectNamedImports } from './utils/collect-named-imports';
import { createGlobalsPlugin } from './utils/create-globals-plugin';

const TWENTY_SHARED_IMPORT_PATTERN =
  /import\s+\{([^}]*)\}\s*from\s*['"]twenty-shared(?:\/([^'"]*?))?['"];?/g;

const TWENTY_SHARED_MODULE_FILTER_PATTERN = /^twenty-shared(\/.*)?$/;

const getGlobalPath = (subPath: string): string => {
  if (subPath === '') {
    return 'globalThis.TwentyShared';
  }

  return `globalThis.TwentyShared['${subPath}']`;
};

export const twentySharedGlobalsPlugin = createGlobalsPlugin({
  name: 'twenty-shared-globals',
  namespace: 'twenty-shared-globals',
  moduleName: 'twenty-shared',
  moduleFilter: TWENTY_SHARED_MODULE_FILTER_PATTERN,
  collectImports: (sourceContent) =>
    collectNamedImports(sourceContent, {
      pattern: TWENTY_SHARED_IMPORT_PATTERN,
      namedImportsCaptureGroup: 1,
      subPathCaptureGroup: 2,
    }),
  generateExports: (imports, subPath) => {
    const globalPath = getGlobalPath(subPath);

    return [...imports]
      .map((name) => `export var ${name} = ${globalPath}.${name};`)
      .join('\n');
  },
});
