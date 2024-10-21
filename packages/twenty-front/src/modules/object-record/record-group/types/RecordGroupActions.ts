import { IconComponent } from 'twenty-ui';

export type RecordGroupAction = {
  id: string;
  label: string;
  icon: IconComponent;
  position: number;
  callback: () => void;
};
