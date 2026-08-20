import { FeatureFlagKey } from 'twenty-shared/types';

import { getFeatureFlagCacheKeysToInvalidate } from 'src/engine/core-modules/feature-flag/utils/get-feature-flag-cache-keys-to-invalidate.util';

describe('getFeatureFlagCacheKeysToInvalidate', () => {
  it('should invalidate ORMEntityMetadatas when the ORM v2 flag changes', () => {
    expect(
      getFeatureFlagCacheKeysToInvalidate([
        FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED,
      ]),
    ).toEqual(['featureFlagsMap', 'ORMEntityMetadatas']);
  });

  it('should invalidate ORMEntityMetadatas when the ORM v2 flag changes among others', () => {
    expect(
      getFeatureFlagCacheKeysToInvalidate([
        FeatureFlagKey.IS_JSON_FILTER_ENABLED,
        FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED,
      ]),
    ).toEqual(['featureFlagsMap', 'ORMEntityMetadatas']);
  });

  it('should only invalidate featureFlagsMap for unrelated flags', () => {
    expect(
      getFeatureFlagCacheKeysToInvalidate([
        FeatureFlagKey.IS_JSON_FILTER_ENABLED,
      ]),
    ).toEqual(['featureFlagsMap']);
  });

  it('should only invalidate featureFlagsMap for an empty change set', () => {
    expect(getFeatureFlagCacheKeysToInvalidate([])).toEqual([
      'featureFlagsMap',
    ]);
  });
});
