import { ThemeColor } from '@/ui/theme/constants/MainColorNames';

export type SettingsObjectFieldSelectFormOption = {
  color: ThemeColor;
  isDefault?: boolean;
  label: string;
  value: string;
};
