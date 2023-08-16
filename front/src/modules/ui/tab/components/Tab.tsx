import * as React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  title: string;
  icon?: React.ReactNode;
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
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2) + ' ' + theme.spacing(2)};
`;

const HoverSpan = styled.span`
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

export function Tab({
  title,
  icon,
  active = false,
  onClick,
  className,
}: OwnProps) {
  return (
    <StyledTab onClick={onClick} active={active} className={className}>
      <HoverSpan>
        {icon}
        {title}
      </HoverSpan>
    </StyledTab>
  );
}
