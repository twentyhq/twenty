import { type IconComponent } from 'twenty-ui/display';

export type ChartSettingsGroup = {
  heading: string;
  items: ChartSettingsItem[];
};

export type ChartSettingsItem = {
  Icon: IconComponent;
  label: string;
  id: string;
  description?: string;
  contextualTextPosition?: 'left' | 'right';
  hasSubMenu?: boolean;
  isSubMenuOpened?: boolean;
  onClick?: () => void;
};
