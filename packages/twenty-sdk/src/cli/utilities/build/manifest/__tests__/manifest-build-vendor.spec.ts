import { join } from 'path';

import {
  MINIMAL_APP_PATH,
  VENDOR_APP_PATH,
} from '@/cli/__tests__/apps/fixture-paths';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { normalizeVendorDependencies } from '@/cli/utilities/build/manifest/utils/normalize-vendor-dependencies';

describe('buildManifest vendor', () => {
  it('extracts the vendor declared by the application', async () => {
    const { manifest, filePaths, errors } =
      await buildManifest(VENDOR_APP_PATH);

    expect(errors).toEqual([]);
    expect(manifest?.application.vendor).toEqual({
      dependencies: ['react', 'react-dom/client', 'react/jsx-runtime'],
      sourceVendorPath: join('src', 'vendor.ts'),
      builtVendorPath: join('src', 'vendor.mjs'),
      builtVendorChecksum: null,
    });
    expect(filePaths.vendor).toEqual([join('src', 'vendor.ts')]);
  }, 60000);

  it('leaves the vendor undefined for an application without one', async () => {
    const { manifest, filePaths, errors } =
      await buildManifest(MINIMAL_APP_PATH);

    expect(errors).toEqual([]);
    expect(manifest?.application.vendor).toBeUndefined();
    expect(filePaths.vendor).toEqual([]);
  }, 60000);
});

describe('normalizeVendorDependencies', () => {
  it('adds the jsx runtime alongside react so the automatic jsx transform resolves it', () => {
    expect(normalizeVendorDependencies(['react'])).toEqual([
      'react',
      'react/jsx-runtime',
    ]);
  });

  it('deduplicates and sorts the declared dependencies', () => {
    expect(normalizeVendorDependencies(['lodash', 'date-fns', 'lodash'])).toEqual(
      ['date-fns', 'lodash'],
    );
  });
});
