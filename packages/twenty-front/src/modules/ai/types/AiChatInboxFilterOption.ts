import { type IconComponent } from 'twenty-ui/icon';

export type AiChatInboxFilterOption = {
  key: string;
  label: string;
  Icon: IconComponent;
  count?: number;
  isUnread?: boolean;
  isSelected: boolean;
  onSelect: () => void;
};
