import React from 'react';
import styled from '@emotion/styled';

import { SoonPill } from '@/ui/pill/components/SoonPill';
import { rgba } from '@/ui/theme/constants/colors';

export enum ButtonSize {
  Medium = 'medium',
  Small = 'small',
}

export enum ButtonPosition {
  Left = 'left',
  Middle = 'middle',
  Right = 'right',
}

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  TertiaryBold = 'tertiaryBold',
  TertiaryLight = 'tertiaryLight',
  Danger = 'danger',
}

export type ButtonProps = {
  icon?: React.ReactNode;
  title?: string;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  position?: ButtonPosition;
  soon?: boolean;
  disabled?: boolean;
} & React.ComponentProps<'button'>;

const StyledButton = styled.button<
  Pick<ButtonProps, 'fullWidth' | 'variant' | 'size' | 'position' | 'title'>
>`
  align-items: center;
  background: ${({ theme, variant, disabled }) => {
    switch (variant) {
      case 'primary':
        if (disabled) {
          return rgba(theme.color.blue, 0.4);
        } else {
          return theme.color.blue;
        }
      case 'secondary':
        return theme.background.primary;
      default:
        return 'transparent';
    }
  }};
  border-color: ${({ theme, variant }) => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return `${theme.background.transparent.medium}`;
      case 'tertiary':
      default:
        return 'none';
    }
  }};
  border-radius: ${({ position }) => {
    switch (position) {
      case 'left':
        return '4px 0px 0px 4px';
      case 'right':
        return '0px 4px 4px 0px';
      case 'middle':
        return '0px';
      default:
        return '4px';
    }
  }};
  border-style: solid;
  border-width: ${({ variant, position }) => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return position === 'middle' ? `1px 0 1px 0` : `1px`;
      case 'tertiary':
      default:
        return '0';
    }
  }};
  box-shadow: ${({ theme, variant }) => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return theme.boxShadow.extraLight;
      default:
        return 'none';
    }
  }};

  color: ${({ theme, variant, disabled }) => {
    if (disabled) {
      if (variant === 'primary') {
        return theme.color.gray0;
      } else {
        return theme.font.color.extraLight;
      }
    }

    switch (variant) {
      case 'primary':
        return theme.color.gray0;
      case 'tertiaryLight':
        return theme.font.color.tertiary;
      case 'danger':
        return theme.color.red;
      default:
        return theme.font.color.secondary;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme, variant }) => {
    switch (variant) {
      case 'tertiary':
      case 'tertiaryLight':
        return theme.font.weight.regular;
      default:
        return theme.font.weight.medium;
    }
  }};
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  justify-content: flex-start;
  padding: ${({ theme, title }) => {
    if (!title) {
      return `${theme.spacing(1)}`;
    }

    return `${theme.spacing(2)} ${theme.spacing(3)}`;
  }};

  transition: background 0.1s ease;

  white-space: nowrap;

  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  &:hover,
  &:active {
    ${({ theme, variant, disabled }) => {
      if (disabled) {
        return '';
      }

      switch (variant) {
        case 'primary':
          return `background: linear-gradient(0deg, ${theme.background.transparent.medium} 0%, ${theme.background.transparent.medium} 100%), ${theme.color.blue}`;
        default:
          return `background: ${theme.background.tertiary}`;
      }
    }};
  }

  &:focus {
    outline: none;
    ${({ theme, variant }) => {
      switch (variant) {
        case 'tertiaryLight':
        case 'tertiaryBold':
        case 'tertiary':
          return `color: ${theme.color.blue};`;
        default:
          return '';
      }
    }};
  }
`;

export function Button({
  icon,
  title,
  fullWidth = false,
  variant = ButtonVariant.Primary,
  size = ButtonSize.Medium,
  position,
  soon = false,
  disabled = false,
  ...props
}: ButtonProps) {
  return (
    <StyledButton
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      position={position}
      disabled={soon || disabled}
      title={title}
      {...props}
    >
      {icon}
      {title}
      {soon && <SoonPill />}
    </StyledButton>
  );
}
