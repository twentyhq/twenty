import { ThemeColor } from '@/ui/theme/constants/MainColorNames';

export type SelectableOption = {
  color: ThemeColor;
  id: string;
  label: string;
  position: number;
  value: string;
  isSelected: boolean;
};
