import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';

export type WorkflowAiAgentObjectPermissionChange = {
  objectMetadataId: string | null;
  permissionKey: SettingsRoleObjectPermissionKey;
};
