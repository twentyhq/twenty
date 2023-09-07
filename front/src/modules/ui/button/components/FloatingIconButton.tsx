import React from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';
import { IconSize } from '@/ui/theme/constants/icon';

export type FloatingIconButtonSize = 'small' | 'medium';
export type FloatingIconButtonPosition =
  | 'standalone'
  | 'left'
  | 'middle'
  | 'right';

export type FloatingIconButtonProps = {
  className?: string;
  Icon?: IconComponent;
  iconSize?: IconSize;
  size?: FloatingIconButtonSize;
  position?: FloatingIconButtonPosition;
  applyShadow?: boolean;
  applyBlur?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const StyledButton = styled.button<
  Pick<
    FloatingIconButtonProps,
    'size' | 'position' | 'applyShadow' | 'applyBlur' | 'focus'
  >
>`
  align-items: center;
  backdrop-filter: ${({ applyBlur }) => (applyBlur ? 'blur(20px)' : 'none')};
  background: ${({ theme }) => theme.background.primary};
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
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  justify-content: center;
  padding: 0;
  position: relative;
  transition: background 0.1s ease;
  white-space: nowrap;

  width: ${({ size }) => (size === 'small' ? '24px' : '32px')};

  &:hover .floating-icon-button-hovered {
    display: flex;
  }

  &:active {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.medium : 'transparent'};
  }

  &:focus {
    outline: none;
  }
`;

const StyledHover = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: calc(${({ theme }) => theme.border.radius.sm} - 2px);
  bottom: 2px;
  box-sizing: border-box;
  display: none;
  left: 2px;
  position: absolute;
  right: 2px;
  top: 2px;
`;

export function FloatingIconButton({
  className,
  Icon,
  iconSize,
  size = 'small',
  position = 'standalone',
  applyShadow = true,
  applyBlur = true,
  disabled = false,
  focus = false,
  onClick,
}: FloatingIconButtonProps) {
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
    >
      {!disabled && <StyledHover className="floating-icon-button-hovered" />}
      {Icon && (
        <Icon {...(iconSize ? { size: theme.icon.size[iconSize] } : {})} />
      )}
    </StyledButton>
  );
}
