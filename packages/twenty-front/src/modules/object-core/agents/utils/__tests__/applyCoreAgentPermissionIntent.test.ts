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

it('recovers a prepared role without replaying untouched default permissions', () => {
  const assignedRole = {
    ...DEFAULT_SETTINGS_DRAFT_ROLE,
    id: 'recovered-role',
    canReadAllObjectRecords: true,
    permissionFlags: [
      { id: 'external-flag', roleId: 'recovered-role', flag: 'EXTERNAL_TOOL' },
    ],
  };
  const result = applyCoreAgentPermissionIntent({
    draftRole: {
      ...DEFAULT_SETTINGS_DRAFT_ROLE,
      id: 'initialization-draft',
      canAccessAllTools: true,
    },
    baseRole: undefined,
    assignedRole,
  });

  expect(result.id).toBe(assignedRole.id);
  expect(result.canReadAllObjectRecords).toBe(true);
  expect(result.permissionFlags).toEqual(assignedRole.permissionFlags);
  expect(result.canAccessAllTools).toBe(true);
});

it('keeps unrelated recovered permissions while applying local entries and later removals', () => {
  const externalFlag = {
    id: 'external-flag',
    roleId: 'assigned-role',
    flag: 'EXTERNAL_TOOL',
  };
  const submittedFlag = {
    id: 'submitted-flag',
    roleId: 'draft-role',
    flag: 'SUBMITTED_TOOL',
  };
  const localFlag = {
    id: 'local-flag',
    roleId: 'draft-role',
    flag: 'LOCAL_TOOL',
  };
  const localObjectPermission = {
    id: 'local-object-permission',
    roleId: 'draft-role',
    objectMetadataId: 'local-object',
    canReadObjectRecords: true,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
  };
  const externalObjectPermission = {
    ...localObjectPermission,
    id: 'external-object-permission',
    roleId: 'assigned-role',
    objectMetadataId: 'external-object',
  };
  const result = applyCoreAgentPermissionIntent({
    baseRole: undefined,
    draftRole: {
      ...DEFAULT_SETTINGS_DRAFT_ROLE,
      id: 'draft-role',
      permissionFlags: [localFlag],
      objectPermissions: [localObjectPermission],
    },
    submittedRole: {
      ...DEFAULT_SETTINGS_DRAFT_ROLE,
      id: 'draft-role',
      permissionFlags: [submittedFlag],
    },
    assignedRole: {
      ...DEFAULT_SETTINGS_DRAFT_ROLE,
      id: 'assigned-role',
      permissionFlags: [externalFlag, submittedFlag],
      objectPermissions: [externalObjectPermission],
    },
  });

  expect(result.permissionFlags).toEqual([externalFlag, localFlag]);
  expect(result.objectPermissions).toEqual([
    externalObjectPermission,
    localObjectPermission,
  ]);
});
