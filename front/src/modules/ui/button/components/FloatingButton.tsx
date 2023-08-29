import React, { useMemo } from 'react';
import styled from '@emotion/styled';

import { TablerIconsProps } from '@/ui/icon';

export type FloatingButtonSize = 'small' | 'medium';
export type FloatingButtonPosition = 'standalone' | 'left' | 'middle' | 'right';

export type FloatingButtonProps = {
  className?: string;
  icon?: React.ReactNode;
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

  border: ${({ focus, theme }) =>
    focus ? `1px solid ${theme.color.blue}` : 'none'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme, applyShadow, focus }) =>
    applyShadow
      ? `0px 2px 4px 0px ${
          theme.background.transparent.light
        }, 0px 0px 4px 0px ${theme.background.transparent.medium}${
          focus ? `,0 0 0 3px ${theme.color.blue10}` : ''
        }`
      : focus
      ? `0 0 0 3px ${theme.color.blue10}`
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

export function FloatingButton({
  className,
  icon: initialIcon,
  title,
  size = 'small',
  applyBlur = true,
  applyShadow = true,
  disabled = false,
  focus = false,
}: FloatingButtonProps) {
  const icon = useMemo(() => {
    if (!initialIcon || !React.isValidElement(initialIcon)) {
      return null;
    }

    return React.cloneElement<TablerIconsProps>(initialIcon as any, {
      size: 14,
    });
  }, [initialIcon]);

  return (
    <StyledButton
      disabled={disabled}
      focus={focus && !disabled}
      size={size}
      applyBlur={applyBlur}
      applyShadow={applyShadow}
      className={className}
    >
      {icon}
      {title}
    </StyledButton>
  );
}
