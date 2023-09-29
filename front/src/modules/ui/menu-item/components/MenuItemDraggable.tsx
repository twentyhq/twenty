import { useTheme } from '@emotion/react';

import { FloatingIconButtonGroup } from '@/ui/button/components/FloatingIconButtonGroup';
import { IconGripVertical } from '@/ui/icon';
import { IconComponent } from '@/ui/icon/types/IconComponent';

import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  StyledHoverableMenuItemBase,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';
import { MenuItemAccent } from '../types/MenuItemAccent';

import { MenuItemIconButton } from './MenuItem';

export type MenuItemDraggableProps = {
  key: string;
  isDragged?: boolean;
  LeftIcon: IconComponent | undefined;
  accent?: MenuItemAccent;
  iconButtons?: MenuItemIconButton[];
  onClick?: () => void;
  text: string;
  isDragDisabled?: boolean;
  className?: string;
};
export const MenuItemDraggable = ({
  key,
  isDragged = false,
  LeftIcon,
  accent = 'default',
  iconButtons,
  onClick,
  text,
  isDragDisabled = false,
  className,
}: MenuItemDraggableProps) => {
  const showIconButtons = Array.isArray(iconButtons) && iconButtons.length > 0;
  const theme = useTheme();

  return (
    <StyledHoverableMenuItemBase
      data-testid={key ?? undefined}
      onClick={onClick}
      accent={accent}
      className={isDragged ? `hover` : className}
    >
      <StyledMenuItemLeftContent>
        {!isDragDisabled && (
          <IconGripVertical
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.extraLight}
          />
        )}
        <MenuItemLeftContent LeftIcon={LeftIcon} text={text} key={key} />
      </StyledMenuItemLeftContent>
      <div className="hoverable-buttons">
        {showIconButtons && (
          <FloatingIconButtonGroup iconButtons={iconButtons} />
        )}
      </div>
    </StyledHoverableMenuItemBase>
  );
};
