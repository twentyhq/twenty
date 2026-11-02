import { type IconComponent } from 'twenty-ui/icon';

export type AiChatInboxFilterOption = {
  key: string;
  label: string;
  Icon: IconComponent;
  count?: number;
  isSelected: boolean;
  onSelect: () => void;
};
