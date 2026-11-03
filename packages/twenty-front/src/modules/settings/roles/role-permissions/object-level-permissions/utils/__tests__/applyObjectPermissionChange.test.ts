import { applyObjectPermissionChange } from '@/settings/roles/role-permissions/object-level-permissions/utils/applyObjectPermissionChange';

describe('applyObjectPermissionChange', () => {
  it('grants reading along with a change', () => {
    expect(
      applyObjectPermissionChange({
        objectPermission: { objectMetadataId: 'person-id' },
        permissionKey: 'canSoftDeleteObjectRecords',
        value: true,
      }),
    ).toEqual({
      objectMetadataId: 'person-id',
      canReadObjectRecords: true,
      canSoftDeleteObjectRecords: true,
    });
  });

  it('refuses every change along with reading', () => {
    expect(
      applyObjectPermissionChange({
        objectPermission: {
          objectMetadataId: 'person-id',
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        },
        permissionKey: 'canReadObjectRecords',
        value: false,
      }),
    ).toEqual({
      objectMetadataId: 'person-id',
      canReadObjectRecords: false,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  });

  it('resets reading along with a change reset to the role default', () => {
    expect(
      applyObjectPermissionChange({
        objectPermission: {
          objectMetadataId: 'person-id',
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        },
        permissionKey: 'canUpdateObjectRecords',
        value: null,
      }),
    ).toEqual({
      objectMetadataId: 'person-id',
      canReadObjectRecords: null,
      canUpdateObjectRecords: null,
    });
  });
});
