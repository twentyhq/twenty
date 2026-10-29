import { type JSX, type ReactElement, type ReactNode } from 'react';
import { type IconComponent, type TablerIconsProps } from 'twenty-ui/icon';
import { type NavigationDrawerItemIndentationLevel } from './NavigationDrawerItemIndentationLevel';
import { type NavigationDrawerItemModifier } from './NavigationDrawerItemModifier';
import { type NavigationDrawerSubItemState } from './NavigationDrawerSubItemState';
import { type TriggerEventType } from '@/ui/navigation/types/TriggerEventType';

export type NavigationDrawerItemProps = {
  className?: string;
  label: string;
  secondaryLabel?: string;
  indentationLevel?: NavigationDrawerItemIndentationLevel;
  subItemState?: NavigationDrawerSubItemState;
  subItemIndentation?: 'default' | 'compact';
  to?: string;
  onClick?: () => void;
  Icon?:
    | IconComponent
    | ((props: TablerIconsProps) => JSX.Element)
    | ReactElement;
  trailingIcon?: ReactNode;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  active?: boolean;
  modifier?: NavigationDrawerItemModifier;
  rightOptions?: ReactNode;
  alwaysShowRightOptions?: boolean;
  isDragging?: boolean;
  isRightOptionsDropdownOpen?: boolean;
  triggerEvent?: TriggerEventType;
  preventCollapseOnMobile?: boolean;
  isSelectedInEditMode?: boolean;
  variant?: 'default' | 'tertiary' | 'placeholder';
  isUnread?: boolean;
};
