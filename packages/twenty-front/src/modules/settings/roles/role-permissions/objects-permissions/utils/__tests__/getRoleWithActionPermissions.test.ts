import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getRoleWithActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleWithActionPermissions';

const EDIT_PERMISSIONS = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

describe('getRoleWithActionPermissions', () => {
  it('writes the action permissions on the role defaults', () => {
    expect(
      getRoleWithActionPermissions({
        role: DEFAULT_SETTINGS_DRAFT_ROLE,
        actionPermissions: EDIT_PERMISSIONS,
      }),
    ).toMatchObject({
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
    });
  });
});
