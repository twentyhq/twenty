import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'path';

import * as esbuild from 'esbuild';
import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';

import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { getBaseFrontComponentBuildOptions } from '@/cli/utilities/build/common/front-component-build/utils/get-base-front-component-build-options';
import { getFrontComponentBuildPlugins } from '@/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';
import { buildSharedDependenciesBundle } from '@/cli/utilities/build/common/front-component-build/shared-dependencies-build/build-shared-dependencies-bundle';
import { removeBuiltSharedDependenciesBundle } from '@/cli/utilities/build/common/front-component-build/shared-dependencies-build/__tests__/utils/remove-built-shared-dependencies-bundle';

const SHARED_DEPENDENCIES_MANIFEST = {
  dependencies: ['axios'],
  builtPath: 'default-export-shared-dependencies.mjs',
  builtChecksum: null,
};

describe('shared dependency shims for a dependency with a default export', () => {
  it('lets a component import the default of a shared es module', async () => {
    const outputDir = await mkdtemp(
      join(MINIMAL_APP_PATH, 'shared-dependencies-default-'),
    );
    const entryPoint = join(outputDir, 'entry.js');

    try {
      const sharedDependenciesBuildContext =
        await buildSharedDependenciesBundle({
          appPath: MINIMAL_APP_PATH,
          sharedDependencies: SHARED_DEPENDENCIES_MANIFEST,
          onFileBuilt: () => {},
        });

      await writeFile(
        entryPoint,
        'import axios from "axios";\nexport default () => axios;\n',
      );

      const result = await esbuild.build({
        ...getBaseFrontComponentBuildOptions(),
        entryPoints: [entryPoint],
        outdir: outputDir,
        plugins: getFrontComponentBuildPlugins({
          getSharedDependenciesBuildContext: () =>
            sharedDependenciesBuildContext,
        }),
      });

      expect(result.errors).toEqual([]);

      const outputMeta = Object.values(result.metafile?.outputs ?? {}).find(
        (metaOutput) => metaOutput.entryPoint?.endsWith('entry.js'),
      );

      expect(
        outputMeta?.imports.some(
          (moduleImport) =>
            moduleImport.path === FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
        ),
      ).toBe(true);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
      await removeBuiltSharedDependenciesBundle({
        appPath: MINIMAL_APP_PATH,
        builtPath: SHARED_DEPENDENCIES_MANIFEST.builtPath,
      });
    }
  }, 120000);
});
