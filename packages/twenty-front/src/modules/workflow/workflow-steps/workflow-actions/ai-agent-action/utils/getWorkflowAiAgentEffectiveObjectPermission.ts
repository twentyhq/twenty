import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type AiRunScope } from 'twenty-shared/ai';

import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';

type AiRunScopeObjectPermission = NonNullable<
  AiRunScope['objectPermissions']
>[number];

export const getWorkflowAiAgentEffectiveObjectPermission = ({
  scope,
  objectPermission,
  permissionKey,
}: {
  scope:
    | Pick<
        AiRunScope,
        | 'canReadAllObjectRecords'
        | 'canUpdateAllObjectRecords'
        | 'canSoftDeleteAllObjectRecords'
        | 'canDestroyAllObjectRecords'
      >
    | undefined;
  objectPermission: AiRunScopeObjectPermission | undefined;
  permissionKey: SettingsRoleObjectPermissionKey;
}): boolean =>
  objectPermission?.[permissionKey] ??
  scope?.[
    SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING[
      permissionKey
    ]
  ] ??
  false;
