import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { type Nullable } from 'twenty-shared/types';

export type CommandMenuItemProps = {
  label: string;
  description?: string;
  to?: string;
  id: string;
  onClick?: () => void;
  Icon?: IconComponent;
  hotKeys?: Nullable<string[]>;
  LeftComponent?: ReactNode;
  RightComponent?: ReactNode;
  contextualTextPosition?: 'left' | 'right';
  hasSubMenu?: boolean;
  isSubMenuOpened?: boolean;
  disabled?: boolean;
};
