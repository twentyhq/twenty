import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { TablerIconsProps } from '@tabler/icons-react';

export type IconButtonSize = 'medium' | 'small';
export type IconButtonPosition = 'standalone' | 'left' | 'middle' | 'right';
export type IconButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type IconButtonAccent = 'default' | 'blue' | 'danger';

export type IconButtonProps = {
  className?: string;
  icon?: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  position?: IconButtonPosition;
  accent?: IconButtonAccent;
  disabled?: boolean;
  focus?: boolean;
  dataTestId?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const StyledButton = styled.button<
  Pick<IconButtonProps, 'variant' | 'size' | 'position' | 'accent' | 'focus'>
>`
  align-items: center;
  ${({ theme, variant, accent, disabled, focus }) => {
    switch (variant) {
      case 'primary':
        switch (accent) {
          case 'default':
            return `
              background: ${theme.background.secondary};
              border-color: ${
                !disabled
                  ? focus
                    ? theme.color.blue
                    : theme.background.transparent.light
                  : 'transparent'
              };
              color: ${
                !disabled
                  ? theme.font.color.secondary
                  : theme.font.color.extraLight
              };
              border-width: ${!disabled && focus ? '1px 1px !important' : 0};
              box-shadow: ${
                !disabled && focus
                  ? `0 0 0 3px ${theme.accent.tertiary}`
                  : 'none'
              };
              &:hover {
                background: ${
                  !disabled
                    ? theme.background.tertiary
                    : theme.background.secondary
                };
              }
              &:active {
                background: ${
                  !disabled
                    ? theme.background.quaternary
                    : theme.background.secondary
                };
              }
            `;
          case 'blue':
            return `
              background: ${!disabled ? theme.color.blue : theme.color.blue20};
              border-color: ${
                !disabled
                  ? focus
                    ? theme.color.blue
                    : theme.background.transparent.light
                  : 'transparent'
              };
              border-width: ${!disabled && focus ? '1px 1px !important' : 0};
              color: ${theme.grayScale.gray0};
              box-shadow: ${
                !disabled && focus
                  ? `0 0 0 3px ${theme.accent.tertiary}`
                  : 'none'
              };
              &:hover {
                background: ${
                  !disabled ? theme.color.blue50 : theme.color.blue20
                };
              }
              &:active {
                background: ${
                  !disabled ? theme.color.blue60 : theme.color.blue20
                };
              }
            `;
          case 'danger':
            return `
              background: ${!disabled ? theme.color.red : theme.color.red20};
              border-color: ${
                !disabled
                  ? focus
                    ? theme.color.red
                    : theme.background.transparent.light
                  : 'transparent'
              };
              border-width: ${!disabled && focus ? '1px 1px !important' : 0};
              box-shadow: ${
                !disabled && focus ? `0 0 0 3px ${theme.color.red10}` : 'none'
              };
              color: ${theme.grayScale.gray0};
              &:hover {
                background: ${
                  !disabled ? theme.color.red50 : theme.color.red20
                };
              }
              &:active {
                background: ${
                  !disabled ? theme.color.red50 : theme.color.red20
                };
              }
            `;
        }
        break;
      case 'secondary':
      case 'tertiary':
        switch (accent) {
          case 'default':
            return `
              background: ${
                focus ? theme.background.transparent.primary : 'transparent'
              };
              border-color: ${
                variant === 'secondary'
                  ? !disabled && focus
                    ? theme.color.blue
                    : theme.background.transparent.light
                  : focus
                  ? theme.color.blue
                  : 'transparent'
              };
              border-width: ${!disabled && focus ? '1px 1px !important' : 0};
              box-shadow: ${
                !disabled && focus
                  ? `0 0 0 3px ${theme.accent.tertiary}`
                  : 'none'
              };
              color: ${
                !disabled
                  ? theme.font.color.secondary
                  : theme.font.color.extraLight
              };
              &:hover {
                background: ${
                  !disabled ? theme.background.transparent.light : 'transparent'
                };
              }
              &:active {
                background: ${
                  !disabled ? theme.background.transparent.light : 'transparent'
                };
              }
            `;
          case 'blue':
            return `
              background: ${
                focus ? theme.background.transparent.primary : 'transparent'
              };
              border-color: ${
                variant === 'secondary'
                  ? !disabled
                    ? theme.color.blue
                    : theme.color.blue20
                  : focus
                  ? theme.color.blue
                  : 'transparent'
              };
              border-width: ${!disabled && focus ? '1px 1px !important' : 0};
              box-shadow: ${
                !disabled && focus
                  ? `0 0 0 3px ${theme.accent.tertiary}`
                  : 'none'
              };
              color: ${!disabled ? theme.color.blue : theme.accent.accent4060};
              &:hover {
                background: ${
                  !disabled ? theme.accent.tertiary : 'transparent'
                };
              }
              &:active {
                background: ${
                  !disabled ? theme.accent.secondary : 'transparent'
                };
              }
            `;
          case 'danger':
            return `
              background: ${
                !disabled ? theme.background.transparent.primary : 'transparent'
              };
              border-color: ${
                variant === 'secondary'
                  ? !disabled
                    ? theme.color.red
                    : theme.color.red20
                  : focus
                  ? theme.color.red
                  : 'transparent'
              };
              border-width: ${!disabled && focus ? '1px 1px !important' : 0};
              box-shadow: ${
                !disabled && focus ? `0 0 0 3px ${theme.color.red10}` : 'none'
              };
              color: ${!disabled ? theme.font.color.danger : theme.color.red20};
              &:hover {
                background: ${
                  !disabled ? theme.background.danger : 'transparent'
                };
              }
              &:active {
                background: ${
                  !disabled ? theme.background.danger : 'transparent'
                };
              }
            `;
        }
    }
  }}

  border-radius: ${({ position, theme }) => {
    switch (position) {
      case 'left':
        return `${theme.border.radius.sm} 0px 0px ${theme.border.radius.sm}`;
      case 'right':
        return `0px ${theme.border.radius.sm} ${theme.border.radius.sm} 0px`;
      case 'middle':
        return '0px';
      case 'standalone':
        return theme.border.radius.sm;
    }
  }};
  border-style: solid;
  border-width: ${({ variant, position }) => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return position === 'middle' ? '1px 0px' : '1px';
      case 'tertiary':
        return '0';
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: ${({ theme }) => theme.font.family};
  font-weight: 500;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  justify-content: center;
  padding: 0;
  transition: background 0.1s ease;

  white-space: nowrap;

  width: ${({ size }) => (size === 'small' ? '24px' : '32px')};

  &:focus {
    outline: none;
  }
`;

export function IconButton({
  className,
  icon: initialIcon,
  variant = 'primary',
  size = 'medium',
  accent = 'default',
  position = 'standalone',
  disabled = false,
  focus = false,
  dataTestId,
  onClick,
}: IconButtonProps) {
  const icon = useMemo(() => {
    if (!initialIcon || !React.isValidElement(initialIcon)) {
      return <></>;
    }

    return React.cloneElement<TablerIconsProps>(initialIcon as any, {
      size: 16,
    });
  }, [initialIcon]);

  return (
    <StyledButton
      data-testid={dataTestId}
      variant={variant}
      size={size}
      position={position}
      disabled={disabled}
      focus={focus}
      accent={accent}
      className={className}
      onClick={onClick}
    >
      {icon}
    </StyledButton>
  );
}
