import React from 'react';
import styled from '@emotion/styled';

import { rgba } from '@/ui/themes/colors';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'tertiaryBold'
  | 'tertiaryLight'
  | 'danger';

export type ButtonSize = 'medium' | 'small';

export type ButtonPosition = 'left' | 'middle' | 'right' | 'solo';

type Props = {
  icon?: React.ReactNode;
  title: string;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  position?: ButtonPosition;
  soon?: boolean;
} & React.ComponentProps<'button'>;

const StyledButton = styled.button<
  Pick<Props, 'fullWidth' | 'variant' | 'size' | 'position'>
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
      default:
        return theme.background.primary;
    }
  }};
  border: ${({ theme, variant }) => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return `1px solid ${theme.background.transparent.medium}`;
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
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};

  transition: background 0.1s ease;

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

const SoonPill = styled.span`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: 50px;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-family: Inter;
  font-size: 11px;
  font-style: normal;
  font-weight: 500;
  gap: 8px;
  height: 16px;
  justify-content: flex-end;
  line-height: 150%;
  margin-left: auto;
  padding: 4px 8px;
`;

export function Button({
  icon,
  title,
  fullWidth = false,
  variant = 'primary',
  size = 'medium',
  position = 'solo',
  soon = false,
  disabled = false,
  ...props
}: Props) {
  return (
    <StyledButton
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      position={position}
      disabled={soon || disabled}
      {...props}
    >
      {icon}
      {title}
      {soon && <SoonPill>Soon</SoonPill>}
    </StyledButton>
  );
}
