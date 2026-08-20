import { PermissionFlagType } from 'twenty-shared/constants';

import { getGrantedPermissionFlags } from 'src/engine/core-modules/application/application-triggered-by/utils/get-granted-permission-flags.util';
import { type UserWorkspacePermissions } from 'src/engine/metadata-modules/permissions/types/user-workspace-permissions';

const buildPermissionFlags = (
  granted: PermissionFlagType[],
): UserWorkspacePermissions['permissionFlags'] =>
  Object.values(PermissionFlagType).reduce(
    (accumulator, permissionFlag) => ({
      ...accumulator,
      [permissionFlag]: granted.includes(permissionFlag),
    }),
    {} as UserWorkspacePermissions['permissionFlags'],
  );

describe('getGrantedPermissionFlags', () => {
  it('should keep only the flags the person was granted', () => {
    expect(
      getGrantedPermissionFlags(
        buildPermissionFlags([
          PermissionFlagType.WORKSPACE_MEMBERS,
          PermissionFlagType.DATA_MODEL,
        ]),
      ),
    ).toEqual([
      PermissionFlagType.WORKSPACE_MEMBERS,
      PermissionFlagType.DATA_MODEL,
    ]);
  });

  it('should grant nothing when no flag is set', () => {
    expect(getGrantedPermissionFlags(buildPermissionFlags([]))).toEqual([]);
  });
});
