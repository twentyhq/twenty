import { getCoreAgentEnabledToolFlags } from '@/object-core/agents/utils/getCoreAgentEnabledToolFlags';
import { getRoleWithCoreAgentToolFlags } from '@/object-core/agents/utils/getRoleWithCoreAgentToolFlags';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';

describe('getRoleWithCoreAgentToolFlags', () => {
  it('keeps the role settings flags and replaces its tool flags', () => {
    const role = {
      ...DEFAULT_SETTINGS_DRAFT_ROLE,
      id: 'role-id',
      permissionFlags: [
        { id: 'flag-1', roleId: 'role-id', flag: 'WORKFLOWS' },
        { id: 'flag-2', roleId: 'role-id', flag: 'SEND_EMAIL_TOOL' },
      ],
    };

    const nextRole = getRoleWithCoreAgentToolFlags({
      role,
      enabledToolFlags: ['HTTP_REQUEST_TOOL'],
    });

    expect(nextRole.permissionFlags?.map(({ flag }) => flag)).toEqual([
      'WORKFLOWS',
      'HTTP_REQUEST_TOOL',
    ]);
  });

  it('turns all tools access into one flag per remaining tool when a tool is removed', () => {
    const role = { ...DEFAULT_SETTINGS_DRAFT_ROLE, canAccessAllTools: true };
    const [removedToolFlag, ...remainingToolFlags] =
      getCoreAgentEnabledToolFlags(role);

    const nextRole = getRoleWithCoreAgentToolFlags({
      role,
      enabledToolFlags: remainingToolFlags,
    });

    expect(nextRole.canAccessAllTools).toBe(false);
    expect(getCoreAgentEnabledToolFlags(nextRole)).toEqual(remainingToolFlags);
    expect(getCoreAgentEnabledToolFlags(nextRole)).not.toContain(
      removedToolFlag,
    );
  });
});
