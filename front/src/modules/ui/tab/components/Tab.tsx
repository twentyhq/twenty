import * as React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  title: string;
  active?: boolean;
  className?: string;
  onClick?: () => void;
};

const StyledTab = styled.div<{ active?: boolean }>`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-color: ${({ theme, active }) =>
    active ? theme.border.color.inverted : 'transparent'};
  color: ${({ theme, active }) =>
    active ? theme.font.color.primary : theme.font.color.secondary};

  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2) + ' ' + theme.spacing(4)};

  &:hover,
  &:active {
    border-color: ${({ theme }) => theme.border.color.inverted};
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

export function Tab({ title, active = false, onClick, className }: OwnProps) {
  return (
    <StyledTab onClick={onClick} active={active} className={className}>
      {title}
    </StyledTab>
  );
}
