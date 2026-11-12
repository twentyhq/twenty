import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { hasObjectPermissionOverride } from '@/settings/roles/role-permissions/objects-permissions/utils/hasObjectPermissionOverride';

describe('hasObjectPermissionOverride', () => {
  const role = {
    ...DEFAULT_SETTINGS_DRAFT_ROLE,
    objectPermissions: [
      {
        objectMetadataId: 'company',
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: null,
        canDestroyObjectRecords: null,
      },
      {
        objectMetadataId: 'person',
        canReadObjectRecords: null,
        canUpdateObjectRecords: null,
        canSoftDeleteObjectRecords: null,
        canDestroyObjectRecords: null,
      },
    ],
  };

  it('should list an object with its own grant', () => {
    expect(
      hasObjectPermissionOverride({ role, objectMetadataId: 'company' }),
    ).toBe(true);
  });

  it('should not list an object that only inherits', () => {
    expect(
      hasObjectPermissionOverride({ role, objectMetadataId: 'person' }),
    ).toBe(false);
  });
});
