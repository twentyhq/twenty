import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { useQuery } from '@apollo/client/react';
import { useIcons } from 'twenty-ui/icon';
import {
  GetPermissionFlagsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useRolePermissionFlagConfig = ({
  permissionType,
  standardPermissionsConfig,
}: {
  permissionType: 'settings' | 'tool';
  standardPermissionsConfig: SettingsRolePermissionsSettingPermission[];
}): SettingsRolePermissionsSettingPermission[] => {
  const { data } = useQuery(GetPermissionFlagsDocument, {
    fetchPolicy: 'cache-and-network',
  });
  const { getIcon } = useIcons();
  const standardPermissionKeys: string[] = Object.values(PermissionFlagType);

  const permissionFlags = data?.getPermissionFlags ?? [];
  const applicationPermissionsConfig = permissionFlags
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
      applicationId: permissionFlags.find(
        (permissionFlag) => permissionFlag.key === permission.key,
      )?.applicationId,
    })),
    ...applicationPermissionsConfig,
  ];
};
