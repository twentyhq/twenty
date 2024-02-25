import { RecordBoardColumnAction } from '@/object-record/record-board/types/RecordBoardColumnAction';
import { ThemeColor } from '@/ui/theme/constants/MainColorNames';

export type RecordBoardColumnDefinition = {
  id: string;
  title: string;
  value: string;
  position: number;
  color: ThemeColor;
  actions: RecordBoardColumnAction[];
};
