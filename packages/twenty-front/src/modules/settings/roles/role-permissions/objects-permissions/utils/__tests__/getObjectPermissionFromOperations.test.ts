import { getObjectPermissionFromOperations } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionFromOperations';

const SEE_ONLY_ROLE = {
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
};

describe('getObjectPermissionFromOperations', () => {
  it('should set See explicitly next to a change the override sets', () => {
    expect(
      getObjectPermissionFromOperations({
        role: SEE_ONLY_ROLE,
        operations: ['canReadObjectRecords', 'canUpdateObjectRecords'],
      }),
    ).toEqual({
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: null,
      canDestroyObjectRecords: null,
    });
  });

  it('should deny every change explicitly when the override removes See', () => {
    expect(
      getObjectPermissionFromOperations({
        role: SEE_ONLY_ROLE,
        operations: [],
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
      getObjectPermissionFromOperations({
        role: { ...SEE_ONLY_ROLE, canReadAllObjectRecords: false },
        operations: [],
      }),
    ).toEqual({
      canReadObjectRecords: null,
      canUpdateObjectRecords: null,
      canSoftDeleteObjectRecords: null,
      canDestroyObjectRecords: null,
    });
  });

  it('should leave operations equal to the all-objects ones inherited', () => {
    expect(
      getObjectPermissionFromOperations({
        role: SEE_ONLY_ROLE,
        operations: ['canReadObjectRecords'],
      }),
    ).toEqual({
      canReadObjectRecords: null,
      canUpdateObjectRecords: null,
      canSoftDeleteObjectRecords: null,
      canDestroyObjectRecords: null,
    });
  });
});
