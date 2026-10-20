import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getEffectiveObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/utils/getEffectiveObjectActionPermissions';

const OBJECT_METADATA_ID = 'object-id';

const ROLE = {
  ...DEFAULT_SETTINGS_DRAFT_ROLE,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
};

describe('getEffectiveObjectActionPermissions', () => {
  it('returns the role defaults when the object has no override', () => {
    expect(
      getEffectiveObjectActionPermissions(ROLE, OBJECT_METADATA_ID),
    ).toEqual({
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  });

  it('applies defined override values and keeps defaults for null ones', () => {
    expect(
      getEffectiveObjectActionPermissions(
        {
          ...ROLE,
          objectPermissions: [
            {
              objectMetadataId: OBJECT_METADATA_ID,
              canReadObjectRecords: null,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: true,
              canDestroyObjectRecords: null,
            },
          ],
        },
        OBJECT_METADATA_ID,
      ),
    ).toEqual({
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: false,
    });
  });
});
