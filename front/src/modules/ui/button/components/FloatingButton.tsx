import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { TablerIconsProps } from '@tabler/icons-react';

export type FloatingButtonSize = 'small' | 'medium';

export type FloatingButtonProps = {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  size?: FloatingButtonSize;
  disabled?: boolean;
};

const StyledButton = styled.button<Pick<FloatingButtonProps, 'size'>>`
  align-items: center;
  backdrop-filter: blur(20px);
  background: ${({ theme }) => theme.background.primary};

  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) =>
    `0px 2px 4px 0px ${theme.background.transparent.light}, 0px 0px 4px 0px ${theme.background.transparent.medium}`};
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
    border-color: ${({ disabled, theme }) =>
      !disabled ? theme.color.blue : 'transparent'};
    border-style: solid;
    border-width: ${({ disabled }) => (!disabled ? '1px' : '0')};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.color.blue10};
    color: ${({ theme }) => theme.color.blue};
    outline: none;
  }
`;

export function FloatingButton({
  className,
  icon: initialIcon,
  title,
  size = 'small',
  disabled = false,
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
    <StyledButton disabled={disabled} size={size} className={className}>
      {icon}
      {title}
    </StyledButton>
  );
}
