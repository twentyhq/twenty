import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'path';

import * as esbuild from 'esbuild';
import { OUTPUT_DIR, VENDOR_BUNDLE_IMPORT_SPECIFIER } from 'twenty-shared/application';

import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { getBaseFrontComponentBuildOptions } from '@/cli/utilities/build/common/front-component-build/utils/get-base-front-component-build-options';
import { getFrontComponentBuildPlugins } from '@/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';
import { buildVendorBundle } from '@/cli/utilities/build/common/vendor-build/build-vendor-bundle';

const VENDOR_MANIFEST = {
  dependencies: ['axios'],
  sourceVendorPath: 'default-export-vendor.ts',
  builtVendorPath: 'default-export-vendor.mjs',
  builtVendorChecksum: null,
};

describe('vendor shims for a dependency with a default export', () => {
  it('lets a component import the default of a vendored es module', async () => {
    const outputDir = await mkdtemp(join(MINIMAL_APP_PATH, 'vendor-default-'));
    const entryPoint = join(outputDir, 'entry.js');

    try {
      const vendorBuildContext = await buildVendorBundle({
        appPath: MINIMAL_APP_PATH,
        vendor: VENDOR_MANIFEST,
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
          getVendorBuildContext: () => vendorBuildContext,
        }),
      });

      expect(result.errors).toEqual([]);

      const outputMeta = Object.values(result.metafile?.outputs ?? {}).find(
        (metaOutput) => metaOutput.entryPoint?.endsWith('entry.js'),
      );

      expect(
        outputMeta?.imports.some(
          (moduleImport) =>
            moduleImport.path === VENDOR_BUNDLE_IMPORT_SPECIFIER,
        ),
      ).toBe(true);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
      await rm(join(MINIMAL_APP_PATH, OUTPUT_DIR), {
        recursive: true,
        force: true,
      });
    }
  }, 120000);
});
