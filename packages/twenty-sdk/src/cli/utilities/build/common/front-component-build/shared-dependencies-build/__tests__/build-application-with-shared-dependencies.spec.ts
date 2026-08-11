import { rm } from 'node:fs/promises';
import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';
import {
  FRONT_COMPONENT_SHARED_DEPENDENCIES_BUILT_PATH,
  OUTPUT_DIR,
  type Manifest,
} from 'twenty-shared/application';

import { SHARED_DEPENDENCIES_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { buildApplication } from '@/cli/utilities/build/common/build-application';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';

describe('buildApplication with a shared dependencies bundle', () => {
  let builtManifest: Manifest;

  beforeAll(async () => {
    const { manifest, filePaths, errors } = await buildManifest(
      SHARED_DEPENDENCIES_APP_PATH,
    );

    expect(errors).toEqual([]);

    if (!isDefined(manifest)) {
      throw new Error(
        'The shared-dependencies-app manifest could not be built',
      );
    }

    const { builtFileInfos } = await buildApplication({
      appPath: SHARED_DEPENDENCIES_APP_PATH,
      manifest,
      filePaths,
    });

    builtManifest = manifestUpdateChecksums({ manifest, builtFileInfos });
  }, 180000);

  afterAll(async () => {
    await rm(join(SHARED_DEPENDENCIES_APP_PATH, OUTPUT_DIR), {
      recursive: true,
      force: true,
    });
  });

  it('records the declared dependencies and the built bundle checksum in the manifest', () => {
    expect(
      builtManifest.application.frontComponentSharedDependencies,
    ).toMatchObject({
      dependencies: ['react', 'react-dom/client', 'react/jsx-runtime'],
      builtPath: FRONT_COMPONENT_SHARED_DEPENDENCIES_BUILT_PATH,
    });
    expect(
      builtManifest.application.frontComponentSharedDependencies?.builtChecksum,
    ).toMatch(/^[0-9a-f]{64}$/);
  });

});
