import React from 'react';
import styled from '@emotion/styled';

export type ButtonSize = 'medium' | 'small';
export type ButtonPosition = 'standalone' | 'left' | 'middle' | 'right';
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonAccent = 'default' | 'blue' | 'danger';

export type ButtonProps = {
  className?: string;
  Icon?: React.ReactNode;
  title?: string;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  position?: ButtonPosition;
  accent?: ButtonAccent;
  soon?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const StyledButton = styled.button<ButtonProps>`
  border: 1px solid transparent;
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
      default:
        return theme.border.radius.sm;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: inline-flex;
  align-items: center;
  font-family: ${({ theme }) => theme.font.family};
  font-weight: 500;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  &:hover {
    border-color: transparent;
    filter: brightness(0.9);
  }

  &:focus {
    outline: none;
  }
`;

export const Button = ({
  className,
  Icon,
  title,
  fullWidth = false,
  variant = 'primary',
  size = 'medium',
  position = 'standalone',
  soon = false,
  disabled = false,
  onClick,
}: ButtonProps) => (
  <StyledButton
    fullWidth={fullWidth}
    variant={variant}
    size={size}
    position={position}
    disabled={soon || disabled}
    className={className}
    onClick={onClick}
  >
    {Icon && Icon}
    {title}
    {soon && 'Soon'}
  </StyledButton>
);
