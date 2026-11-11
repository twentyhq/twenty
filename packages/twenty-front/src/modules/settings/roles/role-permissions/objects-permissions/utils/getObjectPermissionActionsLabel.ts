import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { getObjectPermissionActionLabel } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionActionLabel';
import { t } from '@lingui/core/macro';

export const getObjectPermissionActionsLabel = (
  objectPermissionKeys: SettingsRoleObjectPermissionKey[],
) => {
  const actionLabels = SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter((key) =>
    objectPermissionKeys.includes(key),
  ).map(getObjectPermissionActionLabel);

  if (actionLabels.length === 0) {
    return t`No access`;
  }

  return actionLabels
    .map((actionLabel, index) =>
      index === 0 ? actionLabel : actionLabel.toLocaleLowerCase(),
    )
    .join(', ');
};
