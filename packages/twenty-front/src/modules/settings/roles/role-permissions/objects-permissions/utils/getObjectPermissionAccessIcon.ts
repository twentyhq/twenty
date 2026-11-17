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
  grantedKeys,
  isAdvanced,
}: {
  grantedKeys: SettingsRoleObjectPermissionKey[];
  isAdvanced: boolean;
}): IconComponent => {
  if (isAdvanced) {
    return IconAdjustments;
  }

  const highestGrantedKey = SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter((key) =>
    grantedKeys.includes(key),
  ).at(-1);

  if (!isDefined(highestGrantedKey)) {
    return IconEyeOff;
  }

  return SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[highestGrantedKey].Icon;
};
