import { IconComponent } from 'twenty-ui';

import { MenuItemAccent } from '@/ui/navigation/menu-item/types/MenuItemAccent';

export type ActionBarEntry = {
  label: string;
  Icon: IconComponent;
  accent?: MenuItemAccent;
  onClick?: () => void;
  subActions?: ActionBarEntry[];
  ConfirmationModal?: JSX.Element;
};
