import { ReactNode } from 'react';
export type SettingsRolePermissionsObjectPermission = {
  key: string;
  label: string | ReactNode;
  value?: boolean;
  setValue: (value: boolean) => void;
  revokedBy?: number;
};

export type SettingsRolePermissionsObjectLevelPermission = {
  key: string;
  label: string | ReactNode;
  value?: boolean | null;
  setValue: (value: boolean | null) => void;
};
