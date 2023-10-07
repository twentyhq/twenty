import { MouseEvent } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { FloatingIconButtonGroup } from '@/ui/button/components/FloatingIconButtonGroup';
import { IconGripVertical } from '@/ui/icon';
import { IconComponent } from '@/ui/icon/types/IconComponent';
import { Tag } from '@/ui/tag/components/Tag';
import { ThemeColor } from '@/ui/theme/constants/colors';

import {
  StyledMenuItemBase,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';
import { MenuItemAccent } from '../types/MenuItemAccent';

const StyledHoverableMenuItemBase = styled(StyledMenuItemBase)`
  & .hoverable-buttons {
    opacity: 0;
    pointer-events: none;
    position: fixed;
    right: ${({ theme }) => theme.spacing(2)};
    transition: opacity ${({ theme }) => theme.animation.duration.instant}s ease;
  }

  &:hover {
    & .hoverable-buttons {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

export type MenuItemIconButton = {
  Icon: IconComponent;
  onClick?: (event: MouseEvent<any>) => void;
};

export type MenuItemProps = {
  isDragDisabled?: boolean;
  accent?: MenuItemAccent;
  text: string;
  iconButtons?: MenuItemIconButton[];
  className?: string;
  testId?: string;
  color: ThemeColor;
  onClick?: () => void;
};

export const MenuItemTag = ({
  testId,
  onClick,
  className,
  isDragDisabled,
  accent,
  text,
  color,
  iconButtons,
}: MenuItemProps) => {
  const showIconButtons = Array.isArray(iconButtons) && iconButtons.length > 0;
  const theme = useTheme();
  return (
    <StyledHoverableMenuItemBase
      data-testid={testId ?? undefined}
      onClick={onClick}
      className={className}
      accent={accent}
    >
      <StyledMenuItemLeftContent>
        {!isDragDisabled && (
          <IconGripVertical
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.extraLight}
          />
        )}
        <StyledMenuItemLabel hasLeftIcon={true}>
          <Tag color={color} text={text} />
        </StyledMenuItemLabel>
      </StyledMenuItemLeftContent>
      <div className="hoverable-buttons">
        {showIconButtons && (
          <FloatingIconButtonGroup iconButtons={iconButtons} />
        )}
      </div>
    </StyledHoverableMenuItemBase>
  );
};
