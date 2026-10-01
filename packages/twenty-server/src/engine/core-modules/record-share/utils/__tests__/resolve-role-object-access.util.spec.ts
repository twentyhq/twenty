/* @license Enterprise */

import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';

import { resolveRoleObjectAccess } from 'src/engine/core-modules/record-share/utils/resolve-role-object-access.util';

const rolesPermissions = {
  'role-reader': {
    'object-1': {
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
    },
  },
} as unknown as ObjectsPermissionsByRoleId;

describe('resolveRoleObjectAccess', () => {
  it('should read the permissions of the role on the object', () => {
    expect(
      resolveRoleObjectAccess({
        rolesPermissions,
        roleId: 'role-reader',
        objectMetadataId: 'object-1',
      }),
    ).toEqual({ canRoleRead: true, canRoleUpdate: false });
  });

  it.each([
    ['an unknown role', 'role-unknown', 'object-1'],
    ['no role', undefined, 'object-1'],
    ['an object the role has no permissions on', 'role-reader', 'object-2'],
  ])('should grant nothing for %s', (_, roleId, objectMetadataId) => {
    expect(
      resolveRoleObjectAccess({ rolesPermissions, roleId, objectMetadataId }),
    ).toEqual({ canRoleRead: false, canRoleUpdate: false });
  });
});
