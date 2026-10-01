/* @license Enterprise */

import { resolveRoleObjectAccess } from 'src/engine/core-modules/record-share/utils/resolve-role-object-access.util';

const rolesPermissions = {
  'role-reader': {
    'object-1': {
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
    },
  },
  'role-editor': {
    'object-1': {
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
    },
  },
};

describe('resolveRoleObjectAccess', () => {
  it.each([
    ['role-reader', { canRoleRead: true, canRoleUpdate: false }],
    ['role-editor', { canRoleRead: true, canRoleUpdate: true }],
  ])('should read the permissions of %s on the object', (roleId, expected) => {
    expect(
      resolveRoleObjectAccess({
        rolesPermissions,
        roleId,
        objectMetadataId: 'object-1',
      }),
    ).toEqual(expected);
  });

  it('should grant nothing on an object the role has no permissions on', () => {
    expect(
      resolveRoleObjectAccess({
        rolesPermissions,
        roleId: 'role-reader',
        objectMetadataId: 'object-2',
      }),
    ).toEqual({ canRoleRead: false, canRoleUpdate: false });
  });

  it.each([
    ['an unknown role', 'role-unknown'],
    ['no role', undefined],
  ])('should report nothing for %s', (_, roleId) => {
    expect(
      resolveRoleObjectAccess({
        rolesPermissions,
        roleId,
        objectMetadataId: 'object-1',
      }),
    ).toEqual({ canRoleRead: null, canRoleUpdate: null });
  });
});
