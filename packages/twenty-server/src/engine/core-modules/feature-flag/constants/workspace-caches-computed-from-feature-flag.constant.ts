import { FeatureFlagKey } from 'twenty-shared/types';

import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const WORKSPACE_CACHES_COMPUTED_FROM_FEATURE_FLAG: Partial<
  Record<FeatureFlagKey, WorkspaceCacheKeyName[]>
> = {
  [FeatureFlagKey.IS_CREATE_RECORDS_PERMISSION_ENABLED]: ['rolesPermissions'],
};
