import * as esbuild from 'esbuild';
import path from 'path';
import { type Plugin } from 'vite';

const SOURCE_QUERY_PATTERN = /\?source$/;
const NON_RELATIVE_IMPORT_PATTERN = /^[^./]/;
const SOURCE_ALIAS_IMPORT_PREFIX = '@/';
const VIRTUAL_MODULE_IMPORT_PATTERN = /^__[a-z_]+__$/;

const keepVirtualModuleImportsPlugin: esbuild.Plugin = {
  name: 'keep-virtual-module-imports',
  setup: (build) => {
    build.onResolve(
      { filter: NON_RELATIVE_IMPORT_PATTERN },
      ({ path: importPath }) => {
        if (importPath.startsWith(SOURCE_ALIAS_IMPORT_PREFIX)) {
          return undefined;
        }

        if (VIRTUAL_MODULE_IMPORT_PATTERN.test(importPath)) {
          return { path: importPath, external: true };
        }

        return {
          errors: [
            {
              text: `Cannot import "${importPath}": a ?source module is injected into other bundles, so it can only import its own files and virtual modules named like __virtual_module__`,
            },
          ],
        };
      },
    );
  },
};

export const createBundledSourcePlugin = (): Plugin => ({
  name: 'bundled-source',
  load: {
    filter: { id: SOURCE_QUERY_PATTERN },
    async handler(id) {
      const entryPath = id.replace(SOURCE_QUERY_PATTERN, '');
      const entryDirectory = path.dirname(entryPath);

      const { outputFiles, metafile, warnings } = await esbuild
        .build({
          entryPoints: [entryPath],
          absWorkingDir: entryDirectory,
          bundle: true,
          format: 'esm',
          platform: 'neutral',
          legalComments: 'none',
          metafile: true,
          write: false,
          logLevel: 'silent',
          plugins: [keepVirtualModuleImportsPlugin],
        })
        .catch((buildFailure: esbuild.BuildFailure) => {
          for (const { location } of buildFailure.errors ?? []) {
            if (location !== null) {
              this.addWatchFile(path.resolve(entryDirectory, location.file));
            }
          }
          throw buildFailure;
        });

      for (const inputPath of Object.keys(metafile.inputs)) {
        this.addWatchFile(path.resolve(entryDirectory, inputPath));
      }

      if (warnings.length > 0) {
        const formattedWarnings = await esbuild.formatMessages(warnings, {
          kind: 'warning',
          color: false,
        });
        this.error(
          `Bundling ${entryPath} produced warnings:\n${formattedWarnings.join('\n')}`,
        );
      }

      return {
        code: `export default ${JSON.stringify(outputFiles[0].text)};`,
        moduleType: 'js',
      };
    },
  },
});
