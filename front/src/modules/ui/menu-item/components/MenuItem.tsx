import { MouseEvent } from 'react';

import { FloatingIconButtonGroup } from '@/ui/button/components/FloatingIconButtonGroup';
import { IconComponent } from '@/ui/icon/types/IconComponent';
import { ThemeColor } from '@/ui/theme/constants/colors';

import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  StyledHoverableMenuItemBase,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';
import { MenuItemAccent } from '../types/MenuItemAccent';

export type MenuItemIconButton = {
  Icon: IconComponent;
  onClick?: (event: MouseEvent<any>) => void;
};

export type MenuItemProps = {
  LeftIcon?: IconComponent | null;
  accent?: MenuItemAccent;
  text: string;
  textColor?: ThemeColor;
  iconButtons?: MenuItemIconButton[];
  isTooltipOpen?: boolean;
  className?: string;
  testId?: string;
  onClick?: () => void;
};

export const MenuItem = ({
  LeftIcon,
  accent = 'default',
  text,
  textColor,
  iconButtons,
  isTooltipOpen,
  className,
  testId,
  onClick,
}: MenuItemProps) => {
  const showIconButtons = Array.isArray(iconButtons) && iconButtons.length > 0;

  return (
    <StyledHoverableMenuItemBase
      data-testid={testId ?? undefined}
      onClick={onClick}
      className={className}
      accent={accent}
      isMenuOpen={!!isTooltipOpen}
    >
      <StyledMenuItemLeftContent>
        <MenuItemLeftContent
          textColor={textColor}
          LeftIcon={LeftIcon ?? undefined}
          text={text}
        />
      </StyledMenuItemLeftContent>
      <div className="hoverable-buttons">
        {showIconButtons && (
          <FloatingIconButtonGroup iconButtons={iconButtons} />
        )}
      </div>
    </StyledHoverableMenuItemBase>
  );
};
