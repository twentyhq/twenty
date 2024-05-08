import { MouseEvent } from 'react';
import { IconComponent } from 'twenty-ui';

import { LightIconButtonGroup } from '@/ui/input/button/components/LightIconButtonGroup';

import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  StyledHoverableMenuItemBase,
  StyledMenuItemLeftContent,
  StyledMenuItemRightContent,
} from '../internals/components/StyledMenuItemBase';
import { MenuItemAccent } from '../types/MenuItemAccent';

export type MenuItemIconButton = {
  Icon: IconComponent;
  onClick?: (event: MouseEvent<any>) => void;
};

export type MenuItemProps = {
  LeftIcon?: IconComponent | null;
  RightIcon?: IconComponent | null;
  accent?: MenuItemAccent;
  text: string;
  iconButtons?: MenuItemIconButton[];
  isIconDisplayedOnHoverOnly?: boolean;
  isTooltipOpen?: boolean;
  className?: string;
  testId?: string;
  onClick?: (event: MouseEvent<HTMLLIElement>) => void;
};

export const MenuItem = ({
  LeftIcon,
  RightIcon,
  accent = 'default',
  text,
  iconButtons,
  isTooltipOpen,
  isIconDisplayedOnHoverOnly = true,
  className,
  testId,
  onClick,
}: MenuItemProps) => {
  const showIconButtons = Array.isArray(iconButtons) && iconButtons.length > 0;

  const handleMenuItemClick = (event: MouseEvent<HTMLLIElement>) => {
    if (!onClick) return;
    event.preventDefault();
    event.stopPropagation();

    onClick?.(event);
  };

  return (
    <StyledHoverableMenuItemBase
      data-testid={testId ?? undefined}
      onClick={handleMenuItemClick}
      className={className}
      accent={accent}
      isMenuOpen={!!isTooltipOpen}
      isIconDisplayedOnHoverOnly={isIconDisplayedOnHoverOnly}
    >
      <StyledMenuItemLeftContent>
        <MenuItemLeftContent LeftIcon={LeftIcon ?? undefined} text={text} />
      </StyledMenuItemLeftContent>
      <div className="hoverable-buttons">
        {showIconButtons && (
          <LightIconButtonGroup iconButtons={iconButtons} size="small" />
        )}
      </div>
      <StyledMenuItemRightContent>
        <MenuItemLeftContent LeftIcon={RightIcon ?? undefined} text={''} />
      </StyledMenuItemRightContent>
    </StyledHoverableMenuItemBase>
  );
};
