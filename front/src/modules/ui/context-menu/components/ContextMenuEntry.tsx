import { ReactNode } from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  icon: ReactNode;
  label: string;
  type?: 'standard' | 'danger';
  onClick: () => void;
};

type StyledButtonProps = {
  type: 'standard' | 'danger';
};

const StyledButton = styled.div<StyledButtonProps>`
  align-items: center;
  align-self: stretch;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${(props) =>
    props.type === 'danger'
      ? props.theme.color.red
      : props.theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};

  height: 32px;
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  transition: background 0.1s ease;
  user-select: none;

  &:hover {
    background: ${({ theme, type }) =>
      type === 'danger' ? theme.tag.background.red : theme.background.tertiary};
  }
`;

const StyledButtonLabel = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

export function ContextMenuEntry({
  label,
  icon,
  type = 'standard',
  onClick,
}: OwnProps) {
  return (
    <StyledButton type={type} onClick={onClick}>
      {icon}
      <StyledButtonLabel>{label}</StyledButtonLabel>
    </StyledButton>
  );
}
