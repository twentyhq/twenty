import { type Placement } from '@floating-ui/react';
import { type MouseEvent, type ReactNode } from 'react';
import { type MenuItemAccent } from 'twenty-ui/components';
import { type IconComponent } from 'twenty-ui/icon';

export type MenuItemWithOptionDropdownProps = {
  accent?: MenuItemAccent;
  className?: string;
  dropdownContent: ReactNode;
  dropdownId: string;
  isIconDisplayedOnHoverOnly?: boolean;
  isTooltipOpen?: boolean;
  LeftIcon?: IconComponent | null;
  RightIcon?: IconComponent | null;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void;
  testId?: string;
  text: ReactNode;
  hasSubMenu?: boolean;
  dropdownPlacement?: Placement;
  selected?: boolean;
};
