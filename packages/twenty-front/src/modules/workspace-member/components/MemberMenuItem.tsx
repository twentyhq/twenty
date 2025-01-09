/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { FunctionComponent, MouseEvent, ReactElement, ReactNode } from 'react';
import { IconCheck, IconComponent } from 'twenty-ui';

import { LightIconButtonProps } from '@/ui/input/button/components/LightIconButton';
import { LightIconButtonGroup } from '@/ui/input/button/components/LightIconButtonGroup';
import { MenuItemLeftContent } from '@/ui/navigation/menu-item/internals/components/MenuItemLeftContent';
import { StyledHoverableMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';

import { MenuItemAccent } from '@/ui/navigation/menu-item/types/MenuItemAccent';

export type MenuItemIconButton = {
  Wrapper?: FunctionComponent<{ iconButton: ReactElement }>;
  Icon: IconComponent;
  accent?: LightIconButtonProps['accent'];
  onClick?: (event: MouseEvent<any>) => void;
};

export type MemberMenuItemProps = {
  accent?: MenuItemAccent;
  className?: string;
  iconButtons?: MenuItemIconButton[];
  isIconDisplayedOnHoverOnly?: boolean;
  isTooltipOpen?: boolean;
  LeftIcon?: IconComponent | null;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void;
  testId?: string;
  text: ReactNode;
  hasSubMenu?: boolean;
  backgroundColor?: string;
  isSelected?: boolean;
};

const StyledMenuItem = styled.div<{
  accent?: MenuItemAccent;
  isIconDisplayedOnHoverOnly?: boolean;
  backgroundColor?: string;
}>`
  align-items: center;
  background-color: ${({ backgroundColor, theme }) =>
    backgroundColor || theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ backgroundColor }) =>
    backgroundColor === '#ddfcd8' ? '#2A5822' : '#712727'};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  padding: 5.5px ${({ theme }) => theme.spacing(2)};
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
`;

const StyledIconCheck = styled(IconCheck)`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1.5)};
`;

export const MemberMenuItem = ({
  accent = 'default',
  className,
  iconButtons,
  isIconDisplayedOnHoverOnly = true,
  LeftIcon,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  text,
  hasSubMenu = false,
  backgroundColor,
  isSelected,
}: MemberMenuItemProps) => {
  const theme = useTheme();
  const showIconButtons = Array.isArray(iconButtons) && iconButtons.length > 0;

  const handleMenuItemClick = (event: MouseEvent<HTMLDivElement>) => {
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
      isIconDisplayedOnHoverOnly={isIconDisplayedOnHoverOnly}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <StyledMenuItem backgroundColor={backgroundColor}>
        <MenuItemLeftContent
          LeftIcon={LeftIcon ?? undefined}
          smallIcon={true}
          text={text}
        />
      </StyledMenuItem>
      {isSelected && <StyledIconCheck size={theme.icon.size.sm} />}
      <div className="hoverable-buttons">
        {showIconButtons && (
          <LightIconButtonGroup iconButtons={iconButtons} size="small" />
        )}
      </div>
    </StyledHoverableMenuItemBase>
  );
};
