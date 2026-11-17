import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAdjustments,
  IconEyeOff,
  type IconComponent,
} from 'twenty-ui/icon';

export const getObjectPermissionAccessIcon = ({
  operations,
  isAdvanced,
}: {
  operations: SettingsRoleObjectPermissionKey[];
  isAdvanced: boolean;
}): IconComponent => {
  if (isAdvanced) {
    return IconAdjustments;
  }

  const highestOperation = SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter((key) =>
    operations.includes(key),
  ).at(-1);

  if (!isDefined(highestOperation)) {
    return IconEyeOff;
  }

  return SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[highestOperation].Icon;
};
