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
      getActionPermissionsAfterToggle(
        EDIT_PERMISSIONS,
        'canReadObjectRecords',
        false,
      ),
    ).toEqual({
      canReadObjectRecords: false,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  });

  it('grants read when a higher action is turned on', () => {
    expect(
      getActionPermissionsAfterToggle(
        {
          canReadObjectRecords: false,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
        },
        'canDestroyObjectRecords',
        true,
      ),
    ).toEqual({
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: true,
    });
  });

  it('keeps read when a higher action is turned off', () => {
    expect(
      getActionPermissionsAfterToggle(
        EDIT_PERMISSIONS,
        'canUpdateObjectRecords',
        false,
      ),
    ).toEqual({
      ...EDIT_PERMISSIONS,
      canUpdateObjectRecords: false,
    });
  });
});
