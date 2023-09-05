import { ThemeColor } from '@/ui/theme/constants/colors';

export type BoardColumnDefinition = {
  id: string;
  title: string;
  index: number;
  colorCode: ThemeColor;
};
