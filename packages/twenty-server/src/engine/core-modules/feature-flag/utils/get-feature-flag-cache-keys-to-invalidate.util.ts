import { FeatureFlagKey } from 'twenty-shared/types';

import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const getFeatureFlagCacheKeysToInvalidate = (
  changedFeatureFlagKeys: FeatureFlagKey[],
): WorkspaceCacheKeyName[] => {
  if (
    changedFeatureFlagKeys.includes(FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED)
  ) {
    return ['featureFlagsMap', 'ORMEntityMetadatas'];
  }

  return ['featureFlagsMap'];
};
