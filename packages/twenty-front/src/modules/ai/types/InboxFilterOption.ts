import { type IconComponent } from 'twenty-ui/icon';

export type InboxFilterOption = {
  key: string;
  label: string;
  Icon: IconComponent;
  count?: number;
  isSelected: boolean;
  onSelect: () => void;
};
