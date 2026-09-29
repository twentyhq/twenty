import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const TRACKED_JOB_PERMISSION_CACHE_KEYS: WorkspaceCacheKeyName[] = [
  'rolesPermissions',
  'userWorkspaceRoleMap',
  'flatRoleMaps',
  'flatRowLevelPermissionPredicateMaps',
  'flatRowLevelPermissionPredicateGroupMaps',
  'flatWorkspaceMemberMaps',
  'flatObjectMetadataMaps',
  'flatFieldMetadataMaps',
];
