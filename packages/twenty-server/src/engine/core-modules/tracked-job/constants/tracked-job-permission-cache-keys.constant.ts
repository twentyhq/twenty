import { type WorkspaceCacheOrDerivedCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const TRACKED_JOB_PERMISSION_CACHE_KEYS: WorkspaceCacheOrDerivedCacheKeyName[] =
  [
    'rolesPermissions',
    'userWorkspaceRoleMap',
    'flatRoleMaps',
    'flatRowLevelPermissionPredicateMaps',
    'flatRowLevelPermissionPredicateGroupMaps',
    'flatWorkspaceMemberMaps',
    'flatObjectMetadataMaps',
    'flatFieldMetadataMaps',
  ];
