/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { FunctionComponent, MouseEvent, ReactElement, ReactNode } from 'react';
import { IconCheck, IconComponent } from 'twenty-ui/display';
import { LightIconButtonGroup, LightIconButtonProps } from 'twenty-ui/input';
import {
  MenuItemAccent,
  MenuItemLeftContent,
  StyledHoverableMenuItemBase,
} from 'twenty-ui/navigation';

export type MenuItemIconButton = {
  Wrapper?: FunctionComponent<{ iconButton: ReactElement }>;
  Icon: IconComponent;
  accent?: LightIconButtonProps['accent'];
  onClick?: (event: MouseEvent<any>) => void;
};

export type SelectStatusPillItemProps = {
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
  color: ${({ backgroundColor }) => {
    switch (backgroundColor) {
      case '#ddfcd8':
        return '#2A5822';
      case '#FED8D8':
        return '#712727';
      default:
        return '#000000';
    }
  }};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
`;

const StyledIconCheck = styled(IconCheck)`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1.5)};
`;

export const SelectStatusPillItem = ({
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
}: SelectStatusPillItemProps) => {
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
        <MenuItemLeftContent LeftIcon={LeftIcon ?? undefined} text={text} />
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
