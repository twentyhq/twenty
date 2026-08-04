import { rm } from 'node:fs/promises';
import { join } from 'path';

import { OUTPUT_DIR } from 'twenty-shared/application';

import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { buildVendorBundle } from '@/cli/utilities/build/common/vendor-build/build-vendor-bundle';
import { getUndeclaredBundledReactPackages } from '@/cli/utilities/build/common/vendor-build/utils/get-undeclared-bundled-react-packages';

const buildMetafile = (inputPaths: string[]) => ({
  inputs: Object.fromEntries(
    inputPaths.map((inputPath) => [inputPath, { bytes: 0, imports: [] }]),
  ),
  outputs: {},
});

describe('getUndeclaredBundledReactPackages', () => {
  it('flags react bundled through another dependency', () => {
    expect(
      getUndeclaredBundledReactPackages({
        metafile: buildMetafile(['node_modules/react/index.js']),
        dependencies: ['twenty-ui/input'],
      }),
    ).toEqual(['react']);
  });

  it('stays silent when react is declared', () => {
    expect(
      getUndeclaredBundledReactPackages({
        metafile: buildMetafile([
          'node_modules/react/index.js',
          'node_modules/react/jsx-runtime.js',
        ]),
        dependencies: ['react', 'react/jsx-runtime'],
      }),
    ).toEqual([]);
  });

  it('does not confuse react-dom with react', () => {
    expect(
      getUndeclaredBundledReactPackages({
        metafile: buildMetafile(['node_modules/react-dom/index.js']),
        dependencies: ['react'],
      }),
    ).toEqual(['react-dom']);
  });

  it('stays silent for a dependency unrelated to react', () => {
    expect(
      getUndeclaredBundledReactPackages({
        metafile: buildMetafile(['node_modules/date-fns/index.js']),
        dependencies: ['date-fns'],
      }),
    ).toEqual([]);
  });
});

describe('buildVendorBundle react duplication guard', () => {
  afterAll(async () => {
    await rm(join(MINIMAL_APP_PATH, OUTPUT_DIR), {
      recursive: true,
      force: true,
    });
  });

  it('refuses to build a vendor that bundles react without declaring it', async () => {
    await expect(
      buildVendorBundle({
        appPath: MINIMAL_APP_PATH,
        vendor: {
          dependencies: ['twenty-ui/input'],
          sourceVendorPath: 'undeclared-react-vendor.ts',
          builtVendorPath: 'undeclared-react-vendor.mjs',
          builtVendorChecksum: null,
        },
        onFileBuilt: () => {},
      }),
    ).rejects.toThrow('without declaring');
  }, 180000);
});
