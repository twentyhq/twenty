import { ReactNode } from 'react';
import { IconComponent } from 'twenty-ui/display';
export type SettingsRolePermissionsObjectPermission = {
  key: string;
  label: string | ReactNode;
  value: boolean;
  Icon: IconComponent;
  setValue: (value: boolean) => void;
};
