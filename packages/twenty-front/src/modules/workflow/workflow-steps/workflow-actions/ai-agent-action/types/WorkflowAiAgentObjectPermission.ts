import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';

export type WorkflowAiAgentObjectPermission = {
  // null for all objects
  objectMetadataId: string | null;
} & Partial<Record<SettingsRoleObjectPermissionKey, boolean | null>>;
