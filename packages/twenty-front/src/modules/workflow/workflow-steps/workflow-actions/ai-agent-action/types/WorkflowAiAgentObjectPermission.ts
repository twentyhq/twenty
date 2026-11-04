import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';

export type WorkflowAiAgentObjectPermission = {
  // null for all objects
  objectMetadataId: string | null;
} & Partial<Record<SettingsRoleObjectPermissionKey, boolean | null>>;
