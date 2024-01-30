import { IconComponent } from '@/ui/display/icon/types/IconComponent';

export type RecordBoardColumnAction = {
  id: string;
  label: string;
  icon: IconComponent;
  position: number;
  callback: () => void;
};
