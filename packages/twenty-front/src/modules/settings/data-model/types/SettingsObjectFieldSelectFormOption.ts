import { ThemeColor } from '@/ui/theme/constants/colors';

export type SettingsObjectFieldSelectFormOption = {
  color: ThemeColor;
  isDefault?: boolean;
  label: string;
  value: string;
};
