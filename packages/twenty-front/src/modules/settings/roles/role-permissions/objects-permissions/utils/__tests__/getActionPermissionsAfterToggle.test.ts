import { getActionPermissionsAfterToggle } from '@/settings/roles/role-permissions/objects-permissions/utils/getActionPermissionsAfterToggle';

const EDIT_PERMISSIONS = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

describe('getActionPermissionsAfterToggle', () => {
  it('revokes every action when read is turned off', () => {
    expect(
      getActionPermissionsAfterToggle({
        actionPermissions: EDIT_PERMISSIONS,
        permissionKey: 'canReadObjectRecords',
        value: false,
      }),
    ).toEqual({
      canReadObjectRecords: false,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  });

  it('grants read when a higher action is turned on', () => {
    expect(
      getActionPermissionsAfterToggle({
        actionPermissions: {
          canReadObjectRecords: false,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
        },
        permissionKey: 'canDestroyObjectRecords',
        value: true,
      }),
    ).toEqual({
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: true,
    });
  });

  it('keeps read when a higher action is turned off', () => {
    expect(
      getActionPermissionsAfterToggle({
        actionPermissions: EDIT_PERMISSIONS,
        permissionKey: 'canUpdateObjectRecords',
        value: false,
      }),
    ).toEqual({
      ...EDIT_PERMISSIONS,
      canUpdateObjectRecords: false,
    });
  });
});
