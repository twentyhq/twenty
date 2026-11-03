import { updateCoreAgentToolAccess } from '@/object-core/agents/utils/updateCoreAgentToolAccess';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const ROLE = {
  ...DEFAULT_SETTINGS_DRAFT_ROLE,
  id: 'agent-role',
  canUpdateAllSettings: true,
  permissionFlags: [
    {
      id: 'settings-flag',
      roleId: 'agent-role',
      flag: PermissionFlagType.WORKSPACE,
    },
    { id: 'unknown-flag', roleId: 'agent-role', flag: 'legacy-setting' },
    {
      id: 'email-flag',
      roleId: 'agent-role',
      flag: PermissionFlagType.SEND_EMAIL_TOOL,
    },
  ],
};
const AVAILABLE_TOOL_KEYS = [
  PermissionFlagType.SEND_EMAIL_TOOL,
  PermissionFlagType.CODE_INTERPRETER_TOOL,
  'research-tool',
];
const createPermissionId = () => 'new-permission';

it('materializes all-tools access when removing one tool without removing settings or unknown flags', () => {
  const updated = updateCoreAgentToolAccess({
    role: { ...ROLE, canAccessAllTools: true },
    toolKey: PermissionFlagType.SEND_EMAIL_TOOL,
    isEnabled: false,
    availableToolKeys: [...AVAILABLE_TOOL_KEYS, 'research-tool'],
    createPermissionId,
  });

  expect(updated.canAccessAllTools).toBe(false);
  expect(updated.canUpdateAllSettings).toBe(true);
  expect(updated.permissionFlags?.map(({ flag }) => flag)).toEqual([
    PermissionFlagType.WORKSPACE,
    'legacy-setting',
    PermissionFlagType.CODE_INTERPRETER_TOOL,
    'research-tool',
  ]);
  expect(updated.objectPermissions).toBe(ROLE.objectPermissions);
});

it('adds and removes an application tool while preserving unrelated grants', () => {
  const enabled = updateCoreAgentToolAccess({
    role: ROLE,
    toolKey: 'research-tool',
    isEnabled: true,
    availableToolKeys: AVAILABLE_TOOL_KEYS,
    createPermissionId,
  });
  const disabled = updateCoreAgentToolAccess({
    role: enabled,
    toolKey: 'research-tool',
    isEnabled: false,
    availableToolKeys: AVAILABLE_TOOL_KEYS,
    createPermissionId,
  });

  expect(
    enabled.permissionFlags?.find(({ flag }) => flag === 'research-tool'),
  ).toMatchObject({ id: 'new-permission', roleId: ROLE.id });
  expect(disabled.permissionFlags).toEqual(ROLE.permissionFlags);
});

it('keeps a wildcard grant when enabling an already allowed tool and refuses settings keys', () => {
  const role = { ...ROLE, canAccessAllTools: true };
  expect(
    updateCoreAgentToolAccess({
      role,
      toolKey: PermissionFlagType.CODE_INTERPRETER_TOOL,
      isEnabled: true,
      availableToolKeys: AVAILABLE_TOOL_KEYS,
      createPermissionId,
    }),
  ).toBe(role);
  expect(
    updateCoreAgentToolAccess({
      role,
      toolKey: PermissionFlagType.ROLES,
      isEnabled: true,
      availableToolKeys: AVAILABLE_TOOL_KEYS,
      createPermissionId,
    }),
  ).toBe(role);
});
