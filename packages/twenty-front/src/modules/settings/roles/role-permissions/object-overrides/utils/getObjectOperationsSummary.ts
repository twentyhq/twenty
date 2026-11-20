import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionKeys';
import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
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

  if (orderedOperations.length === 0) {
    return {
      label: t`No access`,
      Icon: isAdvanced ? IconAdjustments : IconEyeOff,
    };
  }

  const [firstOperationLabel, ...otherOperationLabels] = orderedOperations.map(
    (operation) =>
      i18n._(SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[operation].label),
  );
  const label = [
    firstOperationLabel,
    ...otherOperationLabels.map((operationLabel) =>
      operationLabel.toLocaleLowerCase(),
    ),
  ].join(', ');

  if (isAdvanced) {
    return { label, Icon: IconAdjustments };
  }

  const highestOperation = orderedOperations[orderedOperations.length - 1];

  return {
    label,
    Icon: SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[highestOperation].Icon,
  };
};
