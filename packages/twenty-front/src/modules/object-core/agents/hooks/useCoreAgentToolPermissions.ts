import { useActionRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useActionRolePermissionFlagConfig';
import { useRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useRolePermissionFlagConfig';

export const useCoreAgentToolPermissions = () => {
  const standardPermissionsConfig = useActionRolePermissionFlagConfig({
    assignmentCapabilities: {
      canBeAssignedToAgents: true,
      canBeAssignedToUsers: false,
      canBeAssignedToApiKeys: false,
    },
  });

  return useRolePermissionFlagConfig({
    permissionType: 'tool',
    standardPermissionsConfig,
  });
};
