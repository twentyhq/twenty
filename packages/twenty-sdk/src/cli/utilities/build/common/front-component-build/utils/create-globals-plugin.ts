import * as fs from 'fs/promises';

import type * as esbuild from 'esbuild';

type GlobalsPluginData = {
  importer: string;
  originalPath: string;
};

type GlobalsPluginConfig = {
  name: string;
  moduleName: string;
  moduleFilter: RegExp;
  collectImports: (sourceContent: string) => Map<string, Set<string>>;
  generateExports: (imports: Set<string>, subPath: string) => string;
  namespace?: string;
  staticContents?: Record<string, string>;
};

export const createGlobalsPlugin = (
  config: GlobalsPluginConfig,
): esbuild.Plugin => {
  const namespace = config.namespace ?? config.name;

  return {
    name: config.name,
    setup: (build) => {
      const importsByFilePath = new Map<string, Map<string, Set<string>>>();

      build.onStart(() => {
        importsByFilePath.clear();
      });

      build.onResolve(
        { filter: config.moduleFilter },
        async ({ importer, path }) => {
          if (importer && !importsByFilePath.has(importer)) {
            try {
              const sourceFileContent = await fs.readFile(importer, 'utf-8');

              importsByFilePath.set(
                importer,
                config.collectImports(sourceFileContent),
              );
            } catch {
              importsByFilePath.set(importer, new Map());
            }
          }

          return {
            path: importer
              ? `${path}?importer=${encodeURIComponent(importer)}`
              : path,
            namespace,
            pluginData: {
              importer,
              originalPath: path,
            } satisfies GlobalsPluginData,
          };
        },
      );

      build.onLoad({ filter: /.*/, namespace }, ({ pluginData }) => {
        const { originalPath, importer: importerFilePath } =
          pluginData as GlobalsPluginData;

        if (config.staticContents?.[originalPath]) {
          return {
            contents: config.staticContents[originalPath],
            loader: 'js' as const,
          };
        }

        const subPath =
          originalPath === config.moduleName
            ? ''
            : originalPath.replace(`${config.moduleName}/`, '');

        const fileImports = importsByFilePath.get(importerFilePath);
        const subPathImports = fileImports?.get(subPath) ?? new Set<string>();

        return {
          contents: config.generateExports(subPathImports, subPath),
          loader: 'js' as const,
        };
      });
    },
  };
};
