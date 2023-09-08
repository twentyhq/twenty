import * as React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  id: string;
  title: string;
  icon?: React.ReactNode;
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
    background: ${({ theme }) => theme.background.tertiary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
  &:active {
    background: ${({ theme }) => theme.background.quaternary};
  }
`;

export function Tab({
  id,
  title,
  icon,
  active = false,
  onClick,
  className,
  disabled,
}: OwnProps) {
  return (
    <StyledTab
      onClick={onClick}
      active={active}
      className={className}
      disabled={disabled}
      data-testid={'tab-' + id}
    >
      <StyledHover>
        {icon}
        {title}
      </StyledHover>
    </StyledTab>
  );
}
