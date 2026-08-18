import { FeatureFlagKey } from 'twenty-shared/types';

import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

// ORMEntityMetadatas computes from IS_ORM_V2_READ_PATH_ENABLED (it caches an
// empty array for v2 workspaces), so flipping the flag must invalidate it too:
// a stale empty entry makes every v1 query throw EntityMetadataNotFoundError.
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
