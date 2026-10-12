import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';

export type NavigationMenuItemOption = {
  id: string;
  label: string;
  searchableValues?: string[];
  contextualText?: string;
  Icon?: IconComponent;
  icon?: ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
  isAlreadyInSidebar?: boolean;
  hasSubMenu?: boolean;
  accent?: 'default' | 'danger';
};
