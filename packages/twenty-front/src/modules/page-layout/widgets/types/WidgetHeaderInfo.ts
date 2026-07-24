import { type IconComponent } from 'twenty-ui/icon';

export type WidgetHeaderPrimaryAction = {
  Icon: IconComponent;
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

// Header information a widget's content publishes to the widget chrome: a
// count rendered in grey next to the title and an optional primary action
// rendered on the right. Published at runtime so any widget, including
// third-party ones, can contribute without new widget-type branches.
export type WidgetHeaderInfo = {
  count?: number;
  primaryAction?: WidgetHeaderPrimaryAction;
};
