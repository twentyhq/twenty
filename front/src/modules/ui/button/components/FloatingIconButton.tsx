import React from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';

export type FloatingIconButtonSize = 'small' | 'medium';
export type FloatingIconButtonPosition =
  | 'standalone'
  | 'left'
  | 'middle'
  | 'right';

export type FloatingIconButtonProps = {
  className?: string;
  Icon?: IconComponent;
  size?: FloatingIconButtonSize;
  position?: FloatingIconButtonPosition;
  applyShadow?: boolean;
  applyBlur?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
};

const StyledButton = styled.button<
  Pick<
    FloatingIconButtonProps,
    'size' | 'position' | 'applyShadow' | 'applyBlur' | 'focus' | 'isActive'
  >
>`
  align-items: center;
  backdrop-filter: ${({ applyBlur }) => (applyBlur ? 'blur(20px)' : 'none')};
  background: ${({ theme, isActive }) =>
    !!isActive
      ? theme.background.transparent.medium
      : theme.background.primary};
  border: ${({ focus, theme }) =>
    focus ? `1px solid ${theme.color.blue}` : 'transparent'};
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
  box-shadow: ${({ theme, applyShadow, focus }) =>
    applyShadow
      ? `0px 2px 4px ${theme.background.transparent.light}, 0px 0px 4px ${
          theme.background.transparent.medium
        }${focus ? `,0 0 0 3px ${theme.color.blue10}` : ''}`
      : focus
      ? `0 0 0 3px ${theme.color.blue10}`
      : 'none'};
  box-sizing: border-box;
  color: ${({ theme, disabled, focus }) => {
    return !disabled
      ? focus
        ? theme.color.blue
        : theme.font.color.tertiary
      : theme.font.color.extraLight;
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;

  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: 0;
  position: relative;
  transition: background ${({ theme }) => theme.animation.duration.instant}s
    ease;
  white-space: nowrap;

  ${({ position, size }) => {
    const sizeInPx =
      (size === 'small' ? 24 : 32) - (position === 'standalone' ? 0 : 4);

    return `
      height: ${sizeInPx}px;
      width: ${sizeInPx}px;
    `;
  }}

  &:hover {
    background: ${({ theme, isActive }) =>
      !!isActive ?? theme.background.transparent.lighter};
  }

  &:active {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.medium : 'transparent'};
  }

  &:focus {
    outline: none;
  }
`;

export const FloatingIconButton = ({
  className,
  Icon,
  size = 'small',
  position = 'standalone',
  applyShadow = true,
  applyBlur = true,
  disabled = false,
  focus = false,
  onClick,
  isActive,
}: FloatingIconButtonProps) => {
  const theme = useTheme();
  return (
    <StyledButton
      disabled={disabled}
      focus={focus && !disabled}
      size={size}
      applyShadow={applyShadow}
      applyBlur={applyBlur}
      className={className}
      position={position}
      onClick={onClick}
      isActive={isActive}
    >
      {Icon && <Icon size={theme.icon.size.md} />}
    </StyledButton>
  );
};
