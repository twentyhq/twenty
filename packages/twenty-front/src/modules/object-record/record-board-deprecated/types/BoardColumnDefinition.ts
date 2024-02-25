import { ThemeColor } from '@/ui/theme/constants/MainColorNames';

export type BoardColumnDefinition = {
  id: string;
  title: string;
  position: number;
  colorCode?: ThemeColor;
};
