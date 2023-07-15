import React from 'react';
import styled from '@emotion/styled';

export type IconButtonVariant = 'transparent' | 'border' | 'shadow' | 'white';

export type IconButtonSize = 'large' | 'medium' | 'small';

export type ButtonProps = {
  icon?: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
} & React.ComponentProps<'button'>;

const StyledIconButton = styled.button<Pick<ButtonProps, 'variant' | 'size'>>`
  align-items: center;
  background: ${({ theme, variant, disabled }) => {
    switch (variant) {
      case 'shadow':
      case 'white':
        return theme.background.transparent.lighter;
      case 'transparent':
      case 'border':
      default:
        return 'transparent';
    }
  }};
  border-color: ${({ theme, variant }) => {
    switch (variant) {
      case 'border':
        return theme.border.color.medium;
      case 'shadow':
      case 'white':
      case 'transparent':
      default:
        return 'none';
    }
  }};
  transition: background 0.1s ease;
  border-radius: ${({ theme }) => {
    return theme.border.radius.sm;
  }};
  border-width: ${({ variant }) => {
    switch (variant) {
      case 'border':
        return '1px';
      case 'shadow':
      case 'white':
      case 'transparent':
      default:
        return 0;
    }
  }};
  color: ${({ theme, disabled }) => {
    if (disabled) {
      return theme.font.color.extraLight;
    }

    return theme.font.color.tertiary;
  }};
  border-style: solid;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  height: ${({ size }) => {
    switch (size) {
      case 'large':
        return '32px';
      case 'medium':
        return '24px';
      case 'small':
      default:
        return '20px';
    }
  }};
  display: flex;
  justify-content: center;
  padding: 0;
  width: ${({ size }) => {
    switch (size) {
      case 'large':
        return '32px';
      case 'medium':
        return '24px';
      case 'small':
      default:
        return '20px';
    }
  }};
  flex-shrink: 0;
  &:hover {
    background: ${({ theme, disabled }) => {
      return disabled ? 'auto' : theme.background.transparent.light;
    }};
  }
  user-select: none;
  &:active {
    background: ${({ theme, disabled }) => {
      return disabled ? 'auto' : theme.background.transparent.medium;
    }};
`;

export function IconButton({
  icon,
  title,
  variant = 'transparent',
  size = 'medium',
  disabled = false,
  ...props
}: ButtonProps) {
  return (
    <StyledIconButton
      variant={variant}
      size={size}
      disabled={disabled}
      {...props}
    >
      {icon}
    </StyledIconButton>
  );
}
