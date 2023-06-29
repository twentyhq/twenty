import React from 'react';
import styled from '@emotion/styled';

import { rgba } from '@/ui/themes/colors';

type Variant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'tertiaryBold'
  | 'tertiaryLight'
  | 'danger';

type Size = 'medium' | 'small';

type Props = {
  icon?: React.ReactNode;
  title: string;
  fullWidth?: boolean;
  variant?: Variant;
  size?: Size;
} & React.ComponentProps<'button'>;

const StyledButton = styled.button<
  Pick<Props, 'fullWidth' | 'variant' | 'size'>
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
  border-radius: 4px;
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

  &:hover {
    background: ${({ theme, variant, disabled }) => {
      if (disabled) {
        return 'inherit';
      }

      switch (variant) {
        case 'primary':
          return `linear-gradient(0deg, #000 0%, #000 100%), ${theme.color.blue}`;
        default:
          return `${theme.background.tertiary}`;
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
  variant = 'primary',
  size = 'medium',
  ...props
}: Props) {
  return (
    <StyledButton
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      {...props}
    >
      {icon}
      {title}
    </StyledButton>
  );
}
