import { PermissionFlagType } from 'twenty-shared/constants';

import { type UserWorkspacePermissions } from 'src/engine/metadata-modules/permissions/types/user-workspace-permissions';

export const getGrantedPermissionFlags = (
  permissionFlags: UserWorkspacePermissions['permissionFlags'],
): PermissionFlagType[] =>
  Object.values(PermissionFlagType).filter(
    (permissionFlag) => permissionFlags[permissionFlag],
  );
