import { useTheme } from '@emotion/react';
import { ReactElement, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Pill } from 'twenty-ui/components';
import { Avatar, IconComponent } from 'twenty-ui/display';
import { useMouseDownNavigation } from 'twenty-ui/utilities';
import {
  StyledTabBase,
  StyledTabHover,
  StyledTabIconContainer,
} from './TabSharedStyles';

type TabProps = {
  id: string;
  title: string;
  Icon?: IconComponent;
  active?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  pill?: string | ReactElement;
  to?: string;
  logo?: string;
};

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  (
    {
      id,
      title,
      Icon,
      active = false,
      onClick,
      className,
      disabled,
      pill,
      to,
      logo,
    },
    ref,
  ) => {
    const theme = useTheme();
    const { onClick: handleClick, onMouseDown: handleMouseDown } =
      useMouseDownNavigation({
        to,
        onClick,
        disabled,
      });

    const iconColor = active
      ? theme.font.color.primary
      : disabled
        ? theme.font.color.light
        : theme.font.color.secondary;

    return (
      <StyledTabBase
        ref={ref}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        active={active}
        className={className}
        disabled={disabled}
        data-testid={'tab-' + id}
        as={to ? Link : 'button'}
        to={to}
      >
        <StyledTabHover>
          <StyledTabIconContainer>
            {logo && (
              <Avatar
                avatarUrl={logo}
                size="md"
                placeholder={title}
                iconColor={iconColor}
              />
            )}
            {Icon && (
              <Avatar
                Icon={Icon}
                size="md"
                placeholder={title}
                iconColor={iconColor}
              />
            )}
          </StyledTabIconContainer>
          {title}
          {pill && typeof pill === 'string' ? <Pill label={pill} /> : pill}
        </StyledTabHover>
      </StyledTabBase>
    );
  },
);

Tab.displayName = 'Tab';
