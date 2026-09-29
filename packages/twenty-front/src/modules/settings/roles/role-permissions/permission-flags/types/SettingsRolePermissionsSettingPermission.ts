import { type IconComponent } from 'twenty-ui/icon';

export type SettingsRolePermissionsSettingPermission = {
  key: string;
  applicationId?: string;
  name: string;
  description: string;
  Icon: IconComponent;
  isToolPermission?: boolean;
  isRelevantForAgents?: boolean;
  isRelevantForApiKeys?: boolean;
  isRelevantForUsers?: boolean;
};
