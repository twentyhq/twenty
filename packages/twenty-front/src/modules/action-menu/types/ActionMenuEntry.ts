import { MouseEvent, ReactNode } from 'react';
import { IconComponent } from 'twenty-ui';

import { MenuItemAccent } from '@/ui/navigation/menu-item/types/MenuItemAccent';

export type ActionMenuEntry = {
  key: string;
  label: string;
  position: number;
  Icon: IconComponent;
  isPinned?: boolean;
  accent?: MenuItemAccent;
  onClick?: (event?: MouseEvent<HTMLElement>) => void;
  ConfirmationModal?: ReactNode;
};
