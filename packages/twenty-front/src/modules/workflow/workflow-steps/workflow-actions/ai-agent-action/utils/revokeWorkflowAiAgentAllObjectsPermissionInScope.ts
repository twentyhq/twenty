import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type AiRunScope } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';

export const revokeWorkflowAiAgentAllObjectsPermissionInScope = ({
  scope,
  permissionKey,
}: {
  scope: AiRunScope | undefined;
  permissionKey: SettingsRoleObjectPermissionKey;
}): AiRunScope => {
  if (permissionKey !== 'canReadObjectRecords') {
    return {
      ...scope,
      [SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING[
        permissionKey
      ]]: false,
    };
  }

  // an entry still granting an action keeps the reading it relied on, as the tab showed it
  const objectPermissions = scope?.objectPermissions?.map((objectPermission) =>
    !isDefined(objectPermission.canReadObjectRecords) &&
    (objectPermission.canUpdateObjectRecords ||
      objectPermission.canSoftDeleteObjectRecords ||
      objectPermission.canDestroyObjectRecords)
      ? { ...objectPermission, canReadObjectRecords: true }
      : objectPermission,
  );

  return {
    ...scope,
    ...(isDefined(objectPermissions) ? { objectPermissions } : {}),
    canReadAllObjectRecords: false,
    canUpdateAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canDestroyAllObjectRecords: false,
  };
};
