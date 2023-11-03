import { ThemeColor } from '@/ui/theme/constants/colors';

export type BoardColumnDefinition = {
  id: string;
  title: string;
  position: number;
  colorCode?: ThemeColor;
};
