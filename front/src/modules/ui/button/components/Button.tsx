import React, { useMemo } from 'react';
import styled from '@emotion/styled';

import { TablerIconsProps } from '@/ui/icon';
import { SoonPill } from '@/ui/pill/components/SoonPill';

export type ButtonSize = 'medium' | 'small';
export type ButtonPosition = 'standalone' | 'left' | 'middle' | 'right';
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonAccent = 'default' | 'blue' | 'danger';

export type ButtonProps = {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  position?: ButtonPosition;
  accent?: ButtonAccent;
  soon?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const StyledButton = styled.button<
  Pick<
    ButtonProps,
    'fullWidth' | 'variant' | 'size' | 'position' | 'accent' | 'focus'
  >
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
                  ? focus
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
                  ? focus
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
  padding: ${({ theme }) => {
    return `0 ${theme.spacing(2)}`;
  }};

  transition: background 0.1s ease;

  white-space: nowrap;

  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  &:focus {
    outline: none;
  }
`;

export function Button({
  className,
  icon: initialIcon,
  title,
  fullWidth = false,
  variant = 'primary',
  size = 'medium',
  accent = 'default',
  position = 'standalone',
  soon = false,
  disabled = false,
  focus = false,
  onClick,
}: ButtonProps) {
  const icon = useMemo(() => {
    if (!initialIcon || !React.isValidElement(initialIcon)) {
      return null;
    }

    return React.cloneElement<TablerIconsProps>(initialIcon as any, {
      size: 14,
    });
  }, [initialIcon]);

  return (
    <StyledButton
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      position={position}
      disabled={soon || disabled}
      focus={focus}
      accent={accent}
      className={className}
      onClick={onClick}
    >
      {icon}
      {title}
      {soon && <SoonPill />}
    </StyledButton>
  );
}
