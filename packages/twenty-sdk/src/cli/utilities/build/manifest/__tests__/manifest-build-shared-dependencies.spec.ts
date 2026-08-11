import {
  MINIMAL_APP_PATH,
  SHARED_DEPENDENCIES_APP_PATH,
} from '@/cli/__tests__/apps/fixture-paths';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { normalizeSharedDependencies } from '@/cli/utilities/build/manifest/utils/normalize-shared-dependencies';
import { FRONT_COMPONENT_SHARED_DEPENDENCIES_BUILT_PATH } from 'twenty-shared/application';

describe('buildManifest shared dependencies', () => {
  it('extracts the shared dependencies declared in package.json', async () => {
    const { manifest, errors } = await buildManifest(
      SHARED_DEPENDENCIES_APP_PATH,
    );

    expect(errors).toEqual([]);
    expect(manifest?.application.frontComponentSharedDependencies).toEqual({
      dependencies: ['react', 'react-dom/client', 'react/jsx-runtime'],
      builtPath: FRONT_COMPONENT_SHARED_DEPENDENCIES_BUILT_PATH,
      builtChecksum: null,
    });
  }, 60000);

  it('leaves the shared dependencies undefined for an application without one', async () => {
    const { manifest, errors } = await buildManifest(MINIMAL_APP_PATH);

    expect(errors).toEqual([]);
    expect(
      manifest?.application.frontComponentSharedDependencies,
    ).toBeUndefined();
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
