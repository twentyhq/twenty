import { ReactNode } from 'react';
export type SettingsRolePermissionsObjectPermission = {
  key: string;
  label: string | ReactNode;
  value?: boolean | null;
  setValue: (value: boolean) => void;
  overriddenBy?: number;
};
