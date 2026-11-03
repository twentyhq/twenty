import { applyCoreAgentPermissionIntent } from '@/object-core/agents/utils/applyCoreAgentPermissionIntent';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';

it('keeps newer permission reversions while adopting the actual assigned role identity', () => {
  const baseRole = {
    ...DEFAULT_SETTINGS_DRAFT_ROLE,
    id: 'draft-role',
    label: 'Old label',
  };
  const submittedRole = { ...baseRole, canReadAllObjectRecords: true };
  const assignedRole = {
    ...baseRole,
    id: 'assigned-role',
    label: 'Latest saved agent role',
    canReadAllObjectRecords: true,
    permissionFlags: [
      { id: 'external-flag', roleId: 'assigned-role', flag: 'EXTERNAL_TOOL' },
    ],
  };
  const result = applyCoreAgentPermissionIntent({
    draftRole: baseRole,
    baseRole,
    submittedRole,
    assignedRole,
  });

  expect(result.id).toBe(assignedRole.id);
  expect(result.label).toBe(assignedRole.label);
  expect(result.canReadAllObjectRecords).toBe(false);
  expect(result.permissionFlags).toEqual(assignedRole.permissionFlags);
});
