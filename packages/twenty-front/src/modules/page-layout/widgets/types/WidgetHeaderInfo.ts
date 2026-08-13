import { type IconComponent } from 'twenty-ui/icon';

export type WidgetHeaderAction = {
  Icon: IconComponent;
  label: string;
  onClick?: () => void;
  to?: string;
  disabled?: boolean;
};

// An action with `to` renders as a link, otherwise as a button.
export type WidgetHeaderInfo = {
  count?: number;
  actions?: WidgetHeaderAction[];
};
