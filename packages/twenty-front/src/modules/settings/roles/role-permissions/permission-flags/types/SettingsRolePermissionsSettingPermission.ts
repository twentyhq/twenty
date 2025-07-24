import { IconComponent } from 'twenty-ui/display';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export type SettingsRolePermissionsSettingPermission = {
  key: PermissionFlagType;
  name: string;
  description: string;
  Icon: IconComponent;
  isToolPermission?: boolean;
};
