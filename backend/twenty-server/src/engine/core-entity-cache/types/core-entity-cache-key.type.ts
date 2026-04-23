import { type FlatUserWorkspace } from 'src/engine/core-modules/user-workspace/types/flat-user-workspace.type';
import { type FlatUser } from 'src/engine/core-modules/user/types/flat-user.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';

export type CoreEntityCacheDataMap = {
  workspaceEntity: FlatWorkspace;
  user: FlatUser;
  userWorkspaceEntity: FlatUserWorkspace;
};

export type CoreEntityCacheKeyName = keyof CoreEntityCacheDataMap;

export const CORE_ENTITY_CACHE_KEYS: Record<CoreEntityCacheKeyName, string> = {
  workspaceEntity: 'core-entity:workspace',
  user: 'core-entity:user',
  userWorkspaceEntity: 'core-entity:user-workspace',
};
