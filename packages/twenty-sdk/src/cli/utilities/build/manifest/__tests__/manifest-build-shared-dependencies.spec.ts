import { join } from 'path';

import {
  MINIMAL_APP_PATH,
  SHARED_DEPENDENCIES_APP_PATH,
} from '@/cli/__tests__/apps/fixture-paths';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { normalizeSharedDependencies } from '@/cli/utilities/build/manifest/utils/normalize-shared-dependencies';

describe('buildManifest shared dependencies', () => {
  it('extracts the shared dependencies declared by the application', async () => {
    const { manifest, filePaths, errors } = await buildManifest(
      SHARED_DEPENDENCIES_APP_PATH,
    );

    expect(errors).toEqual([]);
    expect(manifest?.application.frontComponentSharedDependencies).toEqual({
      dependencies: ['react', 'react-dom/client', 'react/jsx-runtime'],
      sourcePath: join('src', 'front-component-shared-dependencies.ts'),
      builtPath: join('src', 'front-component-shared-dependencies.mjs'),
      builtChecksum: null,
    });
    expect(filePaths.frontComponentSharedDependencies).toEqual([
      join('src', 'front-component-shared-dependencies.ts'),
    ]);
  }, 60000);

  it('leaves the shared dependencies undefined for an application without one', async () => {
    const { manifest, filePaths, errors } =
      await buildManifest(MINIMAL_APP_PATH);

    expect(errors).toEqual([]);
    expect(
      manifest?.application.frontComponentSharedDependencies,
    ).toBeUndefined();
    expect(filePaths.frontComponentSharedDependencies).toEqual([]);
  }, 60000);
});

describe('normalizeSharedDependencies', () => {
  it('adds the jsx runtime alongside react so the automatic jsx transform resolves it', () => {
    expect(normalizeSharedDependencies(['react'])).toEqual([
      'react',
      'react/jsx-runtime',
    ]);
  });

  it('deduplicates and sorts the declared dependencies', () => {
    expect(
      normalizeSharedDependencies(['lodash', 'date-fns', 'lodash']),
    ).toEqual(['date-fns', 'lodash']);
  });
});
