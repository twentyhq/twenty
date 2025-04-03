import { IconComponent } from 'twenty-ui/display';
import { SettingPermissionType } from '~/generated-metadata/graphql';

export type SettingsRolePermissionsSettingPermission = {
  key: SettingPermissionType;
  name: string;
  description: string;
  Icon: IconComponent;
};
