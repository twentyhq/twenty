import { IconComponent } from 'twenty-ui';

export type RecordBoardColumnAction = {
  id: string;
  label: string;
  icon: IconComponent;
  position: number;
  callback: () => void;
};
