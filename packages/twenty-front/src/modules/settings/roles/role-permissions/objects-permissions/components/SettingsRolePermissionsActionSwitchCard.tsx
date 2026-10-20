import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';
import { t } from '@lingui/core/macro';
import { Card } from 'twenty-ui/primitives/surfaces';

type SettingsRolePermissionsActionSwitchCardProps = {
  actionPermissions: SettingsRoleObjectActionPermissions;
  objectLabelPlural: string;
  disabled?: boolean;
  onToggle: (
    permissionKey: SettingsRoleObjectPermissionKey,
    value: boolean,
  ) => void;
};

export const SettingsRolePermissionsActionSwitchCard = ({
  actionPermissions,
  objectLabelPlural,
  disabled,
  onToggle,
}: SettingsRolePermissionsActionSwitchCardProps) => {
  const actionLabels: Record<
    SettingsRoleObjectPermissionKey,
    { title: string; description: string }
  > = {
    canReadObjectRecords: {
      title: t`See`,
      description: t`See all ${objectLabelPlural}`,
    },
    canUpdateObjectRecords: {
      title: t`Edit`,
      description: t`Edit all ${objectLabelPlural}`,
    },
    canSoftDeleteObjectRecords: {
      title: t`Delete`,
      description: t`Delete all ${objectLabelPlural}`,
    },
    canDestroyObjectRecords: {
      title: t`Destroy`,
      description: t`Destroy all ${objectLabelPlural}`,
    },
  };

  return (
    <Card.Root>
      {SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.map((permissionKey, index) => (
        <SettingsOptionCardContentSwitch
          key={permissionKey}
          Icon={SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[permissionKey].Icon}
          title={actionLabels[permissionKey].title}
          description={actionLabels[permissionKey].description}
          checked={actionPermissions[permissionKey]}
          disabled={disabled}
          divider={index < SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.length - 1}
          onChange={(value) => onToggle(permissionKey, value)}
        />
      ))}
    </Card.Root>
  );
};
