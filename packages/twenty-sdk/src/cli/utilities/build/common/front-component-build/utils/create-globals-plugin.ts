import * as fs from 'fs/promises';

import type * as esbuild from 'esbuild';

type GlobalsPluginData = {
  importerFilePath: string;
  originalPath: string;
};

type GlobalsPluginConfig = {
  pluginName: string;
  moduleName: string;
  moduleFilter: RegExp;
  collectImports: (sourceContent: string) => Map<string, Set<string>>;
  generateExports: (params: {
    namedImports: Set<string>;
    moduleSubPath: string;
  }) => string;
  namespace?: string;
  staticContents?: Record<string, string>;
};

export const createGlobalsPlugin = (
  config: GlobalsPluginConfig,
): esbuild.Plugin => {
  const namespace = config.namespace ?? config.pluginName;

  return {
    name: config.pluginName,
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
              importerFilePath: importer,
              originalPath: path,
            } satisfies GlobalsPluginData,
          };
        },
      );

      build.onLoad({ filter: /.*/, namespace }, ({ pluginData }) => {
        const { originalPath, importerFilePath } =
          pluginData as GlobalsPluginData;

        if (config.staticContents?.[originalPath]) {
          return {
            contents: config.staticContents[originalPath],
            loader: 'js' as const,
          };
        }

        const moduleSubPath =
          originalPath === config.moduleName
            ? ''
            : originalPath.replace(`${config.moduleName}/`, '');

        const importsBySubPath = importsByFilePath.get(importerFilePath);
        const namedImportsForSubPath =
          importsBySubPath?.get(moduleSubPath) ?? new Set<string>();

        return {
          contents: config.generateExports({
            namedImports: namedImportsForSubPath,
            moduleSubPath,
          }),
          loader: 'js' as const,
        };
      });
    },
  };
};
