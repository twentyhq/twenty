import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type AiRunScope } from 'twenty-shared/ai';

export const WORKFLOW_AI_AGENT_ALL_OBJECTS_PERMISSION_KEYS = {
  canReadObjectRecords: 'canReadAllObjectRecords',
  canUpdateObjectRecords: 'canUpdateAllObjectRecords',
  canSoftDeleteObjectRecords: 'canSoftDeleteAllObjectRecords',
  canDestroyObjectRecords: 'canDestroyAllObjectRecords',
} as const satisfies Record<SettingsRoleObjectPermissionKey, keyof AiRunScope>;
