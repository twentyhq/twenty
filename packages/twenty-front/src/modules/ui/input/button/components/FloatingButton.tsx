import React from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';

export type FloatingButtonSize = 'small' | 'medium';
export type FloatingButtonPosition = 'standalone' | 'left' | 'middle' | 'right';

export type FloatingButtonProps = {
  className?: string;
  Icon?: IconComponent;
  title?: string;
  size?: FloatingButtonSize;
  position?: FloatingButtonPosition;
  applyShadow?: boolean;
  applyBlur?: boolean;
  disabled?: boolean;
  focus?: boolean;
};

const StyledButton = styled.button<
  Pick<
    FloatingButtonProps,
    'size' | 'focus' | 'position' | 'applyBlur' | 'applyShadow'
  >
>`
  align-items: center;
  backdrop-filter: ${({ applyBlur }) => (applyBlur ? 'blur(20px)' : 'none')};
  background: ${({ theme }) => theme.background.primary};

  border: ${({ theme }) => `1px solid ${theme.color.blue}`};
  border-radius: ${({ theme, position }) => {
    switch (position) {
      case 'left':
        return `${theme.border.radius.sm} 0 0 ${theme.border.radius.sm}`;
      case 'middle':
        return '0';
      case 'right':
        return `0 ${theme.border.radius.sm} ${theme.border.radius.sm} 0`;
      default:
        return theme.border.radius.sm;
    }
  }};
  border-right: ${({ position }) => (position !== 'right' ? 'none' : '')};
  box-shadow: ${({ applyShadow, position, theme }) =>
    applyShadow && position !== 'middle'
      ? `0 2px 4px ${theme.background.transparent.light}`
      : 'none'};

  color: ${({ theme, disabled, focus }) => {
    return !disabled
      ? focus
        ? theme.color.blue
        : theme.font.color.secondary
      : theme.font.color.extraLight;
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;

  flex-direction: row;
  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  margin: 0;
  padding: ${({ theme }) => {
    return `0 ${theme.spacing(2)}`;
  }};
  transition: background 0.1s ease;

  white-space: nowrap;

  &:hover {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.lighter : 'transparent'};
  }

  &:active {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.medium : 'transparent'};
  }

  &:focus {
    outline: none;
  }
`;

export const FloatingButton = ({
  className,
  Icon,
  title,
  size = 'small',
  applyBlur = true,
  applyShadow = true,
  disabled = false,
  focus = false,
  position = 'standalone',
}: FloatingButtonProps) => {
  const theme = useTheme();
  return (
    <StyledButton
      applyBlur={applyBlur}
      applyShadow={applyShadow}
      className={className}
      disabled={disabled}
      focus={focus && !disabled}
      position={position}
      size={size}
    >
      {Icon && <Icon size={theme.icon.size.sm} />}
      {title}
    </StyledButton>
  );
};
