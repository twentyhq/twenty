import styled from '@emotion/styled';
import { ReactNode } from 'react';

type OwnProps = {
  icon: ReactNode;
  label: string;
  type?: 'standard' | 'warning';
  onClick: () => void;
};

type StyledButtonProps = {
  type: 'standard' | 'warning';
};

const StyledButton = styled.div<StyledButtonProps>`
  display: flex;
  cursor: pointer;
  user-select: none;
  color: ${(props) =>
    props.type === 'warning' ? props.theme.red : props.theme.text60};
  justify-content: center;

  padding: ${(props) => props.theme.spacing(2)};
  border-radius: 4px;
  transition: background 0.1s ease;

  &:hover {
    background: ${(props) => props.theme.tertiaryBackground};
  }
`;

const StyledButtonLabel = styled.div`
  margin-left: ${(props) => props.theme.spacing(2)};
  font-weight: 500;
`;

export function EntityTableActionBarButton({
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
