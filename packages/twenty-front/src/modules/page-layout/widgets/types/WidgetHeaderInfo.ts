import { type IconComponent } from 'twenty-ui/icon';

type WidgetHeaderActionBase = {
  id: string;
  Icon: IconComponent;
  label: string;
  disabled?: boolean;
};

export type WidgetHeaderAction = WidgetHeaderActionBase &
  (
    | {
        onClick: () => void;
        to?: never;
      }
    | {
        onClick?: never;
        to: string;
      }
  );

export type WidgetHeaderInfo = {
  count?: number;
  actions?: WidgetHeaderAction[];
};
