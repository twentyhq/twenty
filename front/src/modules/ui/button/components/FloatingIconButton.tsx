import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { TablerIconsProps } from '@tabler/icons-react';

export type FloatingIconButtonSize = 'small' | 'medium';
export type FloatingIconButtonPosition =
  | 'standalone'
  | 'left'
  | 'middle'
  | 'right';

export type FloatingIconButtonProps = {
  className?: string;
  icon?: React.ReactNode;
  size?: FloatingIconButtonSize;
  position?: FloatingIconButtonPosition;
  applyShadow?: boolean;
  applyBlur?: boolean;
  disabled?: boolean;
};

const StyledButton = styled.button<
  Pick<
    FloatingIconButtonProps,
    'size' | 'position' | 'applyShadow' | 'applyBlur'
  >
>`
  align-items: center;
  backdrop-filter: ${({ applyBlur }) =>
    applyBlur ? 'blur(20px)' : 'transparent'};

  background: ${({ theme }) => theme.background.primary};
  border: none;
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
  box-shadow: ${({ theme, applyShadow }) =>
    applyShadow
      ? `0px 2px 4px ${theme.background.transparent.light}, 0px 0px 4px ${theme.background.transparent.medium}`
      : 'none'};
  color: ${({ theme, disabled }) => {
    return !disabled ? theme.font.color.tertiary : theme.font.color.extraLight;
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
  transition: background 0.1s ease;
  white-space: nowrap;

  width: ${({ size }) => (size === 'small' ? '24px' : '32px')};

  &:hover {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.lighter : 'transparent'};
  }

  &:active {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.medium : 'transparent'};
  }

  &:focus {
    border-color: ${({ disabled, theme }) =>
      !disabled ? theme.color.blue : 'transparent'};
    border-style: solid;
    border-width: ${({ disabled }) => (!disabled ? '1px' : '0')};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.color.blue10};
    color: ${({ theme }) => theme.color.blue};
    outline: none;
  }
`;

export function FloatingIconButton({
  className,
  icon: initialIcon,
  size = 'small',
  position = 'standalone',
  applyShadow = true,
  disabled = false,
}: FloatingIconButtonProps) {
  const icon = useMemo(() => {
    if (!initialIcon || !React.isValidElement(initialIcon)) {
      return null;
    }

    return React.cloneElement<TablerIconsProps>(initialIcon as any, {
      size: 16,
    });
  }, [initialIcon]);

  return (
    <StyledButton
      disabled={disabled}
      size={size}
      className={className}
      position={position}
    >
      {icon}
    </StyledButton>
  );
}
