import { MouseEvent, ReactNode } from 'react';
import { IconComponent } from 'twenty-ui';

import { MenuItemAccent } from '@/ui/navigation/menu-item/types/MenuItemAccent';

export type ActionMenuEntry = {
  label: string;
  Icon: IconComponent;
  accent?: MenuItemAccent;
  onClick?: (event?: MouseEvent<HTMLElement>) => void;
  ConfirmationModal?: ReactNode;
};
