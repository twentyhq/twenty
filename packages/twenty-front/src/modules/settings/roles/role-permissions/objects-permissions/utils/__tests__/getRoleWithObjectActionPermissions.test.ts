import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getRoleWithObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleWithObjectActionPermissions';

const EDIT_PERMISSIONS = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

describe('getRoleWithObjectActionPermissions', () => {
  it('keeps the other properties of an existing override', () => {
    const role = getRoleWithObjectActionPermissions({
      role: {
        ...DEFAULT_SETTINGS_DRAFT_ROLE,
        objectPermissions: [
          {
            objectMetadataId: 'object-id',
            canReadObjectRecords: false,
            restrictedFields: { field: { canRead: false } },
          },
        ],
      },
      objectMetadataId: 'object-id',
      actionPermissions: EDIT_PERMISSIONS,
    });

    expect(role.objectPermissions).toEqual([
      {
        objectMetadataId: 'object-id',
        restrictedFields: { field: { canRead: false } },
        ...EDIT_PERMISSIONS,
      },
    ]);
  });

  it('adds an override for an object without one', () => {
    const role = getRoleWithObjectActionPermissions({
      role: DEFAULT_SETTINGS_DRAFT_ROLE,
      objectMetadataId: 'object-id',
      actionPermissions: EDIT_PERMISSIONS,
    });

    expect(role.objectPermissions).toEqual([
      { objectMetadataId: 'object-id', ...EDIT_PERMISSIONS },
    ]);
  });
});
