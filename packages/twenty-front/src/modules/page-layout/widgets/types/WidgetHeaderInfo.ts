import { type IconComponent } from 'twenty-ui/icon';

type WidgetHeaderActionBase = {
  id: string;
  Icon: IconComponent;
  label: string;
};

export type WidgetHeaderAction = WidgetHeaderActionBase &
  (
    | {
        onClick: () => void;
        disabled?: boolean;
        to?: never;
      }
    | {
        onClick?: never;
        disabled?: never;
        to: string;
      }
  );

export type WidgetHeaderInfo = {
  count?: number;
  actions?: WidgetHeaderAction[];
};
