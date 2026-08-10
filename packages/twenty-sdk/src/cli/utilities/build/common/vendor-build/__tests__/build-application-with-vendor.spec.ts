import { readFile, rm } from 'node:fs/promises';
import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';
import {
  OUTPUT_DIR,
  VENDOR_BUNDLE_IMPORT_SPECIFIER,
  type Manifest,
} from 'twenty-shared/application';

import { VENDOR_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { buildApplication } from '@/cli/utilities/build/common/build-application';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';

describe('buildApplication with a vendor bundle', () => {
  let builtManifest: Manifest;

  beforeAll(async () => {
    const { manifest, filePaths, errors } =
      await buildManifest(VENDOR_APP_PATH);

    expect(errors).toEqual([]);

    if (!isDefined(manifest)) {
      throw new Error('The vendor app manifest could not be built');
    }

    const { builtFileInfos } = await buildApplication({
      appPath: VENDOR_APP_PATH,
      manifest,
      filePaths,
    });

    builtManifest = manifestUpdateChecksums({ manifest, builtFileInfos });
  }, 180000);

  afterAll(async () => {
    await rm(join(VENDOR_APP_PATH, OUTPUT_DIR), {
      recursive: true,
      force: true,
    });
  });

  it('records the declared dependencies and the built bundle checksum in the manifest', () => {
    expect(builtManifest.application.vendor).toMatchObject({
      dependencies: ['react', 'react-dom/client', 'react/jsx-runtime'],
      sourceVendorPath: join('src', 'vendor.ts'),
      builtVendorPath: join('src', 'vendor.mjs'),
    });
    expect(builtManifest.application.vendor?.builtVendorChecksum).toMatch(
      /^[0-9a-f]{64}$/,
    );
  });

  it('writes a vendor bundle the components import instead of bundling react', async () => {
    const vendorBundle = await readFile(
      join(VENDOR_APP_PATH, OUTPUT_DIR, 'src', 'vendor.mjs'),
      'utf-8',
    );
    const componentBundle = await readFile(
      join(VENDOR_APP_PATH, OUTPUT_DIR, 'src', 'counter.front-component.mjs'),
      'utf-8',
    );

    expect(vendorBundle).toContain('__vendor_react__');
    expect(componentBundle).toContain(VENDOR_BUNDLE_IMPORT_SPECIFIER);
    expect(componentBundle).not.toContain('@license React');
    expect(componentBundle.length).toBeLessThan(vendorBundle.length / 10);
  });
});
