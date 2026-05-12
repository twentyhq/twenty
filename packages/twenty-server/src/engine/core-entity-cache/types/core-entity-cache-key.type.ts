import { isValidUuid } from 'twenty-shared/utils';

import { isJwkThumbprint } from 'src/engine/core-modules/jwt/utils/is-jwk-thumbprint.util';
import { type FlatUserWorkspace } from 'src/engine/core-modules/user-workspace/types/flat-user-workspace.type';
import { type FlatUser } from 'src/engine/core-modules/user/types/flat-user.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';

export type CoreEntityCacheDataMap = {
  workspaceEntity: FlatWorkspace;
  user: FlatUser;
  userWorkspaceEntity: FlatUserWorkspace;
  jwtPublicKey: string;
};

export type CoreEntityCacheKeyName = keyof CoreEntityCacheDataMap;

type CoreEntityCacheKeyConfig = {
  prefix: string;
  isValidId: (entityId: string) => boolean;
};

export const CORE_ENTITY_CACHE_KEYS: Record<
  CoreEntityCacheKeyName,
  CoreEntityCacheKeyConfig
> = {
  workspaceEntity: { prefix: 'workspace', isValidId: isValidUuid },
  user: { prefix: 'user', isValidId: isValidUuid },
  userWorkspaceEntity: { prefix: 'user-workspace', isValidId: isValidUuid },
  jwtPublicKey: { prefix: 'jwt-public-key', isValidId: isJwkThumbprint },
};
