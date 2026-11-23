import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';

export type WorkflowAiAgentObjectPermissionChange = {
  objectMetadataId: string | null;
  permissionKey: SettingsRoleObjectPermissionKey;
};
