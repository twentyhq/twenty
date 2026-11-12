import { getObjectPermissionOverrideGrants } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionOverrideGrants';

const SEE_ONLY_ROLE = {
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
};

describe('getObjectPermissionOverrideGrants', () => {
  it('should leave grants equal to the all-objects ones inherited', () => {
    expect(
      getObjectPermissionOverrideGrants({
        role: SEE_ONLY_ROLE,
        grantedKeys: ['canReadObjectRecords', 'canUpdateObjectRecords'],
      }),
    ).toEqual({
      canReadObjectRecords: null,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: null,
      canDestroyObjectRecords: null,
    });
  });

  it('should deny every change explicitly when the override removes See', () => {
    expect(
      getObjectPermissionOverrideGrants({
        role: SEE_ONLY_ROLE,
        grantedKeys: [],
      }),
    ).toEqual({
      canReadObjectRecords: false,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  });

  it('should inherit everything when all objects have no access either', () => {
    expect(
      getObjectPermissionOverrideGrants({
        role: { ...SEE_ONLY_ROLE, canReadAllObjectRecords: false },
        grantedKeys: [],
      }),
    ).toEqual({
      canReadObjectRecords: null,
      canUpdateObjectRecords: null,
      canSoftDeleteObjectRecords: null,
      canDestroyObjectRecords: null,
    });
  });
});
