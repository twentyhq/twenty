import { IconComponent, MenuItemAccent } from 'twenty-ui';

export type ActionBarEntry = {
  label: string;
  Icon: IconComponent;
  accent?: MenuItemAccent;
  onClick?: () => void;
  subActions?: ActionBarEntry[];
};
