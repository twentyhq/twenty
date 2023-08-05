import React from 'react';
import styled from '@emotion/styled';

export type IconButtonVariant = 'transparent' | 'border' | 'shadow' | 'white';

export type IconButtonSize = 'large' | 'medium' | 'small';

export type IconButtonFontColor = 'primary' | 'secondary' | 'tertiary';

export type ButtonProps = {
  icon?: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  customColor?: string;
  textColor?: IconButtonFontColor;
} & React.ComponentProps<'button'>;

const StyledIconButton = styled.button<
  Pick<ButtonProps, 'variant' | 'size' | 'textColor' | 'customColor'>
>`
  align-items: center;
  background: ${({ theme, variant }) => {
    switch (variant) {
      case 'shadow':
      case 'white':
        return theme.background.transparent.primary;
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
  border-radius: ${({ theme }) => {
    return theme.border.radius.sm;
  }};
  border-style: solid;
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
  box-shadow: ${({ theme, variant }) => {
    switch (variant) {
      case 'shadow':
        return theme.boxShadow.light;
      case 'border':
      case 'white':
      case 'transparent':
      default:
        return 'none';
    }
  }};
  color: ${({ theme, disabled, textColor, customColor }) => {
    if (disabled) {
      return theme.font.color.extraLight;
    }

    return customColor
      ? customColor
      : theme.font.color[textColor ?? 'secondary'];
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-shrink: 0;
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
  justify-content: center;
  outline: none;
  padding: 0;
  transition: background 0.1s ease;
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
  }
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
`;

export function IconButton({
  icon,
  variant = 'transparent',
  size = 'medium',
  textColor = 'tertiary',
  disabled = false,
  customColor,
  ...props
}: ButtonProps) {
  return (
    <StyledIconButton
      variant={variant}
      size={size}
      disabled={disabled}
      textColor={textColor}
      customColor={customColor}
      {...props}
    >
      {icon}
    </StyledIconButton>
  );
}
