import * as React from 'react';
import styled from '@emotion/styled';

type OwnProps<T> = {
  id: string;
  title: string;
  Icon?: React.ComponentType<T>;
  iconProps?: T;
  active?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

const StyledTab = styled.div<{ active?: boolean; disabled?: boolean }>`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-color: ${({ theme, active }) =>
    active ? theme.border.color.inverted : 'transparent'};
  color: ${({ theme, active, disabled }) =>
    active
      ? theme.font.color.primary
      : disabled
      ? theme.font.color.light
      : theme.font.color.secondary};
  cursor: pointer;

  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2) + ' ' + theme.spacing(2)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : '')};
`;

const StyledHover = styled.span`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

export function Tab<T extends Record<string, unknown>>({
  id,
  title,
  Icon,
  iconProps,
  active = false,
  onClick,
  className,
  disabled,
}: OwnProps<T>) {
  return (
    <StyledTab
      onClick={onClick}
      active={active}
      className={className}
      disabled={disabled}
      data-testid={'tab-' + id}
    >
      <StyledHover>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        {Icon && <Icon {...iconProps} />}
        {title}
      </StyledHover>
    </StyledTab>
  );
}
