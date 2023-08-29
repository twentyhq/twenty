import React, { MouseEvent, useMemo } from 'react';
import styled from '@emotion/styled';

import { TablerIconsProps } from '@/ui/icon';

export type LightButtonAccent = 'secondary' | 'tertiary';

export type LightButtonProps = {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  accent?: LightButtonAccent;
  active?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

const StyledButton = styled.button<
  Pick<LightButtonProps, 'accent' | 'active' | 'focus'>
>`
  align-items: center;
  background: transparent;
  border: ${({ theme, focus }) =>
    focus ? `1px solid ${theme.color.blue}` : 'none'};

  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme, focus }) =>
    focus ? `0 0 0 3px  ${theme.color.blue10}` : 'none'};
  color: ${({ theme, accent, active, disabled, focus }) => {
    switch (accent) {
      case 'secondary':
        return active || focus
          ? theme.color.blue
          : !disabled
          ? theme.font.color.secondary
          : theme.font.color.extraLight;
      case 'tertiary':
        return active || focus
          ? theme.color.blue
          : !disabled
          ? theme.font.color.tertiary
          : theme.font.color.extraLight;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;

  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: ${({ theme }) => theme.spacing(1)};
  height: 24px;
  padding: ${({ theme }) => {
    return `0 ${theme.spacing(2)}`;
  }};

  transition: background 0.1s ease;

  white-space: nowrap;

  &:hover {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.light : 'transparent'};
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.medium : 'transparent'};
  }
`;

export function LightButton({
  className,
  icon: initialIcon,
  title,
  active = false,
  accent = 'secondary',
  disabled = false,
  focus = false,
  onClick,
}: LightButtonProps) {
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
      onClick={onClick}
      disabled={disabled}
      focus={focus && !disabled}
      accent={accent}
      className={className}
      active={active}
    >
      {icon}
      {title}
    </StyledButton>
  );
}
