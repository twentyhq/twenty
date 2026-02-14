import { type ExportsConfig } from '../types/ExportsConfig';

import { getLastPathFolder } from './getLastPathFolder';

const generateModulePackageExports = (
  moduleDirectories: string[],
  withStyleCssExport: boolean,
) => {
  const initialExports: ExportsConfig = withStyleCssExport
    ? { './style.css': './dist/style.css' }
    : {};

  return moduleDirectories.reduce<ExportsConfig>(
    (accumulator, moduleDirectory) => {
      const moduleName = getLastPathFolder(moduleDirectory);

      if (moduleName === undefined) {
        throw new Error(
          `Should never occur, moduleName is undefined ${moduleDirectory}`,
        );
      }

      return {
        ...accumulator,
        [`./${moduleName}`]: {
          types: `./dist/${moduleName}/index.d.ts`,
          import: `./dist/${moduleName}.mjs`,
          require: `./dist/${moduleName}.cjs`,
        },
      };
    },
    initialExports,
  );
};

export const computePackageJsonFilesAndExportsConfig = (
  moduleDirectories: string[],
  withStyleCssExport: boolean,
) => {
  const entrypoints = moduleDirectories.map(getLastPathFolder);

  const exports = {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.mjs',
      require: './dist/index.cjs',
    },
    ...generateModulePackageExports(moduleDirectories, withStyleCssExport),
  } satisfies ExportsConfig;

  const typesVersionsEntries = entrypoints.reduce<Record<string, string[]>>(
    (accumulator, moduleName) => ({
      ...accumulator,
      [`${moduleName}`]: [`dist/${moduleName}/index.d.ts`],
    }),
    {},
  );

  return {
    exports,
    typesVersions: { '*': typesVersionsEntries },
    files: ['dist', ...entrypoints],
  };
};
