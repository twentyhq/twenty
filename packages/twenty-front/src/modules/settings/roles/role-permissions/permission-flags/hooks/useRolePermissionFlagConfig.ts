import { settingsPermissionFlagDefinitionsState } from '@/settings/roles/states/settingsPermissionFlagDefinitionsState';
import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIcons } from 'twenty-ui/icon';
import { type PermissionFlagPermissionType } from 'twenty-shared/application';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useRolePermissionFlagConfig = ({
  permissionType,
  standardPermissionsConfig,
}: {
  permissionType: PermissionFlagPermissionType;
  standardPermissionsConfig: SettingsRolePermissionsSettingPermission[];
}) => {
  const settingsPermissionFlagDefinitions = useAtomStateValue(
    settingsPermissionFlagDefinitionsState,
  );
  const { getIcon } = useIcons();
  const standardPermissionKeys: string[] = Object.values(PermissionFlagType);

  const applicationPermissionsConfig = settingsPermissionFlagDefinitions
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
      applicationId: settingsPermissionFlagDefinitions.find(
        (permissionFlag) => permissionFlag.key === permission.key,
      )?.applicationId,
    })),
    ...applicationPermissionsConfig,
  ];
};
