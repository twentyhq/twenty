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

  margin: 0;
  padding: ${({ theme }) => {
    return `0 ${theme.spacing(2)}`;
  }};

  ${({ theme, focus }) => `
  border: 1px solid ${
    focus ? theme.color.blue : theme.background.transparent.medium
  };
  ${
    focus
      ? `
    z-index: 1;
    margin-right: -1px;
  `
      : ''
  }
`};

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
  border-right: ${({ position, focus }) =>
    position !== 'right' && !focus ? 'none' : ''};

  box-shadow: ${({ theme, applyShadow, focus }) =>
    applyShadow
      ? `0px 2px 4px ${theme.background.transparent.light}, 0px 0px 4px ${
          theme.background.transparent.medium
        }${focus ? `,0 0 0 3px ${theme.color.blue10}` : ''}`
      : focus
        ? `0 0 0 3px ${theme.color.blue10}`
        : 'none'};

  color: ${({ theme, disabled }) => {
    return !disabled ? theme.font.color.secondary : theme.font.color.extraLight;
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;

  flex-direction: row;
  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  transition: background 0.1s ease;

  white-space: nowrap;

  &:hover {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.lighter : 'transparent'};
    border-color: ${({ theme }) => theme.background.transparent.light};
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
