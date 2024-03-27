import { ThemeColor } from 'twenty-ui';

export type SettingsObjectFieldSelectFormOption = {
  color: ThemeColor;
  isDefault?: boolean;
  label: string;
  value: string;
};
