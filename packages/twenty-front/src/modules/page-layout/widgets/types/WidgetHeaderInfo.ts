import { type IconComponent } from 'twenty-ui/icon';

export type WidgetHeaderAction =
  | {
      actionType: 'button';
      Icon: IconComponent;
      label: string;
      onClick: () => void;
      disabled?: boolean;
    }
  | {
      actionType: 'link';
      Icon: IconComponent;
      label: string;
      to: string;
      disabled?: boolean;
    };

export type NonEmptyWidgetHeaderActions = [
  WidgetHeaderAction,
  ...WidgetHeaderAction[],
];

export type WidgetHeaderInfo = {
  count?: number;
  actions?: NonEmptyWidgetHeaderActions;
};
