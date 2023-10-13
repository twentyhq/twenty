import { ThemeColor } from '@/ui/Themes/theme/constants/colors';

export type BoardColumnDefinition = {
  id: string;
  title: string;
  index: number;
  colorCode?: ThemeColor;
};
