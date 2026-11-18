import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getDraftRoleSyncedWithPersistedRole } from '@/settings/roles/role/utils/getDraftRoleSyncedWithPersistedRole';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

const PERSISTED_ROLE: RoleWithPartialMembers = {
  ...DEFAULT_SETTINGS_DRAFT_ROLE,
  id: 'role-id',
  label: 'Sales',
  canReadAllObjectRecords: true,
};

const REFRESHED_ROLE: RoleWithPartialMembers = {
  ...PERSISTED_ROLE,
  canReadAllObjectRecords: false,
};

describe('getDraftRoleSyncedWithPersistedRole', () => {
  it('should return the persisted role when the draft is for another role', () => {
    expect(
      getDraftRoleSyncedWithPersistedRole({
        draftRole: DEFAULT_SETTINGS_DRAFT_ROLE,
        initialDraftRole: undefined,
        persistedRole: PERSISTED_ROLE,
      }),
    ).toEqual(PERSISTED_ROLE);
  });

  it('should return the persisted role when the draft has no unsaved changes', () => {
    expect(
      getDraftRoleSyncedWithPersistedRole({
        draftRole: PERSISTED_ROLE,
        initialDraftRole: PERSISTED_ROLE,
        persistedRole: REFRESHED_ROLE,
      }),
    ).toEqual(REFRESHED_ROLE);
  });

  it('should keep unsaved edits when the persisted role is refreshed', () => {
    const editedDraftRole = { ...PERSISTED_ROLE, label: 'Edited' };

    expect(
      getDraftRoleSyncedWithPersistedRole({
        draftRole: editedDraftRole,
        initialDraftRole: PERSISTED_ROLE,
        persistedRole: REFRESHED_ROLE,
      }),
    ).toEqual(editedDraftRole);
  });
});
