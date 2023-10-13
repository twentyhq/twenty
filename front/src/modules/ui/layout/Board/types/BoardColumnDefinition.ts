import { ThemeColor } from '@/ui/theme/theme/constants/colors';

export type BoardColumnDefinition = {
  id: string;
  title: string;
  index: number;
  colorCode?: ThemeColor;
};
