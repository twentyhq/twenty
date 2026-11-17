import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAdjustments,
  type IconComponent,
  IconEyeOff,
} from 'twenty-ui/icon';

export const getObjectOperationsSummary = ({
  operations,
  isAdvanced,
}: {
  operations: SettingsRoleObjectPermissionKey[];
  isAdvanced: boolean;
}): { label: string; Icon: IconComponent } => {
  const orderedOperations = SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter((key) =>
    operations.includes(key),
  );
  const highestOperation = orderedOperations.at(-1);

  const label =
    orderedOperations.length === 0
      ? t`No access`
      : orderedOperations
          .map((operation, index) => {
            const operationLabel = i18n._(
              SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[operation].label,
            );

            return index === 0
              ? operationLabel
              : operationLabel.toLocaleLowerCase();
          })
          .join(', ');

  if (isAdvanced) {
    return { label, Icon: IconAdjustments };
  }

  return {
    label,
    Icon: isDefined(highestOperation)
      ? SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[highestOperation].Icon
      : IconEyeOff,
  };
};
