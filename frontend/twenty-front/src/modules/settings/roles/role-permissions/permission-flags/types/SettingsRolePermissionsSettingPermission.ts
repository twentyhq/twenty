import { type IconComponent } from 'twenty-ui/display';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export type SettingsRolePermissionsSettingPermission = {
  key: PermissionFlagType;
  name: string;
  description: string;
  Icon: IconComponent;
  isToolPermission?: boolean;
  isRelevantForAgents?: boolean;
  isRelevantForApiKeys?: boolean;
  isRelevantForUsers?: boolean;
};
