import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { init, parse } from 'cjs-module-lexer';
import * as esbuild from 'esbuild';
import ts from 'typescript';
import { isDefined } from 'twenty-shared/utils';

import { getWatchInputPlugins } from '@/app/dev/collect-watch-inputs';
import { getBaseFrontComponentBuildOptions } from '@/app/bundles/front-component-build/utils/get-base-front-component-build-options';
import { type SharedDependenciesExportNames } from '@/app/bundles/front-component-build/shared-dependencies-build/types/shared-dependencies-export-names.type';

export const enumerateSharedDependenciesExportNames = async ({
  appPath,
  specifier,
}: {
  appPath: string;
  specifier: string;
}): Promise<SharedDependenciesExportNames> => {
  try {
    const options = getBaseFrontComponentBuildOptions();
    const isWrappedJsxRuntime = specifier === 'react/jsx-runtime';
    const result = await esbuild.build({
      ...options,
      absWorkingDir: appPath,
      plugins: [
        ...getWatchInputPlugins(),
        ...(options.plugins ?? []).filter(
          (plugin) =>
            isWrappedJsxRuntime || plugin.name !== 'jsx-runtime-remote-wrapper',
        ),
      ],
      entryPoints: [specifier],
      write: false,
      outfile: 'shared-dependency-probe.js',
      outExtension: undefined,
      external: [],
      sourcemap: false,
      metafile: true,
    });
    const output = Object.values(result.metafile.outputs).find((entry) =>
      isDefined(entry.entryPoint),
    );

    if (!isDefined(output?.entryPoint))
      throw new Error('Missing dependency entry point.');

    const exports = new Set(output.exports);
    const visited = new Set<string>();
    const collectReexportedNames = async (path: string): Promise<void> => {
      if (visited.has(path)) return;
      visited.add(path);

      const input = result.metafile.inputs[path];

      if (!isDefined(input)) return;
      const source = await readFile(resolve(appPath, path), 'utf8');
      let reexports: string[];

      if (input.format === 'cjs') {
        await init();
        const transformed = await esbuild.transform(source, {
          define: options.define,
          minifySyntax: true,
          loader: 'js',
        });
        const parsed = parse(transformed.code);

        for (const name of parsed.exports) {
          if (name !== '__esModule') exports.add(name);
        }
        reexports = parsed.reexports;
      } else {
        const sourceFile = ts.createSourceFile(
          path,
          source,
          ts.ScriptTarget.Latest,
        );
        reexports = sourceFile.statements.flatMap((statement) =>
          ts.isExportDeclaration(statement) &&
          !isDefined(statement.exportClause) &&
          isDefined(statement.moduleSpecifier) &&
          ts.isStringLiteral(statement.moduleSpecifier)
            ? [statement.moduleSpecifier.text]
            : [],
        );
      }

      for (const reexport of reexports) {
        const imported = input.imports.find(
          (entry) => entry.original === reexport && !entry.external,
        );

        if (isDefined(imported)) await collectReexportedNames(imported.path);
      }
    };

    // The virtual JSX wrapper declares all of its exports in the build metadata.
    if (!isWrappedJsxRuntime) await collectReexportedNames(output.entryPoint);

    return {
      namedExports: [...exports].filter((name) => name !== 'default').sort(),
      hasDefaultExport: exports.has('default'),
    };
  } catch (cause) {
    throw new Error(
      `Unable to determine the exports of shared dependency "${specifier}". Check that it is installed and importable from the application.`,
      { cause },
    );
  }
};
