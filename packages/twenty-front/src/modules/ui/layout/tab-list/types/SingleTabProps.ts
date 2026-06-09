import { type IconComponent } from 'twenty-ui-deprecated/display';

export type SingleTabProps<T extends string = string> = {
  title: string;
  Icon?: IconComponent;
  id: T;
  hide?: boolean;
  disabled?: boolean;
  pill?: string | React.ReactElement;
  logo?: string;
  tooltipContent?: string;
};
