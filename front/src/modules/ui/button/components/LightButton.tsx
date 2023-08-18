import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { TablerIconsProps } from '@tabler/icons-react';

export type LightButtonAccent = 'secondary' | 'tertiary';

export type LightButtonProps = {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  accent?: LightButtonAccent;
  active?: boolean;
  disabled?: boolean;
};

const StyledButton = styled.button<Pick<LightButtonProps, 'accent' | 'active'>>`
  align-items: center;
  background: transparent;
  border: none;

  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme, accent, active, disabled }) => {
    switch (accent) {
      case 'secondary':
        return active
          ? theme.color.blue
          : !disabled
          ? theme.font.color.secondary
          : theme.font.color.extraLight;
      case 'tertiary':
        return active
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

export function LightButton({
  className,
  icon: initialIcon,
  title,
  active = false,
  accent = 'secondary',
  disabled = false,
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
      disabled={disabled}
      accent={accent}
      className={className}
      active={active}
    >
      {icon}
      {title}
    </StyledButton>
  );
}
