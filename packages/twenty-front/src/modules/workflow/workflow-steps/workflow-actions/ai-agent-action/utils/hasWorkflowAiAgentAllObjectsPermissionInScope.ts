import { type AiRunScope } from 'twenty-shared/ai';

import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';

export const hasWorkflowAiAgentAllObjectsPermissionInScope = (
  scope: AiRunScope | undefined,
): boolean =>
  Object.values(
    SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING,
  ).some(
    (allObjectsPermissionKey) => scope?.[allObjectsPermissionKey] ?? false,
  );
