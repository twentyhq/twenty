import { ThemeColor } from '@/ui/theme/constants/colors';

export type RecordBoardColumnDefinition = {
  id: string;
  title: string;
  position: number;
  colorCode?: ThemeColor;
};
