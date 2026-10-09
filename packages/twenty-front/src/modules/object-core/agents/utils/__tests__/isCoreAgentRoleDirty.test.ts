import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isCoreAgentRoleDirty } from '@/object-core/agents/utils/isCoreAgentRoleDirty';

const ROLE_ID = 'role-id';

const PERSISTED_ROLE: RoleWithPartialMembers = {
  ...DEFAULT_SETTINGS_DRAFT_ROLE,
  id: ROLE_ID,
  label: 'Agent role',
  canReadAllObjectRecords: true,
  canBeAssignedToAgents: true,
};

describe('isCoreAgentRoleDirty', () => {
  it('should not be dirty while the saved role is still loading', () => {
    expect(
      isCoreAgentRoleDirty({
        roleId: ROLE_ID,
        draftRole: DEFAULT_SETTINGS_DRAFT_ROLE,
        persistedRole: undefined,
      }),
    ).toBe(false);
  });

  it('should not be dirty before the saved role is copied into the draft', () => {
    expect(
      isCoreAgentRoleDirty({
        roleId: ROLE_ID,
        draftRole: DEFAULT_SETTINGS_DRAFT_ROLE,
        persistedRole: PERSISTED_ROLE,
      }),
    ).toBe(false);
  });

  it('should not be dirty when the draft matches the saved role', () => {
    expect(
      isCoreAgentRoleDirty({
        roleId: ROLE_ID,
        draftRole: PERSISTED_ROLE,
        persistedRole: PERSISTED_ROLE,
      }),
    ).toBe(false);
  });

  it('should be dirty when the draft has edits to the saved role', () => {
    expect(
      isCoreAgentRoleDirty({
        roleId: ROLE_ID,
        draftRole: { ...PERSISTED_ROLE, canReadAllObjectRecords: false },
        persistedRole: PERSISTED_ROLE,
      }),
    ).toBe(true);
  });

  it('should not be dirty when the agent has no role', () => {
    expect(
      isCoreAgentRoleDirty({
        roleId: null,
        draftRole: DEFAULT_SETTINGS_DRAFT_ROLE,
        persistedRole: undefined,
      }),
    ).toBe(false);
  });
});
