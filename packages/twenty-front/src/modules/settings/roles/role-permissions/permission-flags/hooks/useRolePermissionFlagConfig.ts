import { settingsPermissionFlagsState } from '@/settings/roles/states/settingsPermissionFlagsState';
import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIcons } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useRolePermissionFlagConfig = ({
  permissionType,
  standardPermissionsConfig,
}: {
  permissionType: 'settings' | 'tool';
  standardPermissionsConfig: SettingsRolePermissionsSettingPermission[];
}) => {
  const settingsPermissionFlags = useAtomStateValue(
    settingsPermissionFlagsState,
  );
  const { getIcon } = useIcons();
  const standardPermissionKeys: string[] = Object.values(PermissionFlagType);

  const applicationPermissionsConfig = settingsPermissionFlags
    .filter(
      (permissionFlag) =>
        permissionFlag.permissionType === permissionType &&
        !standardPermissionKeys.includes(permissionFlag.key),
    )
    .map((permissionFlag) => ({
      key: permissionFlag.key,
      applicationId: permissionFlag.applicationId,
      name: permissionFlag.label,
      description: permissionFlag.description ?? '',
      Icon: getIcon(permissionFlag.icon, 'IconApps'),
      isToolPermission: permissionType === 'tool',
    }));

  return [
    ...standardPermissionsConfig.map((permission) => ({
      ...permission,
      applicationId: settingsPermissionFlags.find(
        (permissionFlag) => permissionFlag.key === permission.key,
      )?.applicationId,
    })),
    ...applicationPermissionsConfig,
  ];
};
