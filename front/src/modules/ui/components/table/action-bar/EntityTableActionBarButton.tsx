import { ReactNode } from 'react';
import styled from '@emotion/styled';

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
  border-radius: 4px;
  color: ${(props) =>
    props.type === 'warning' ? props.theme.red : props.theme.text60};
  cursor: pointer;
  display: flex;
  justify-content: center;

  padding: ${(props) => props.theme.spacing(2)};
  transition: background 0.1s ease;
  user-select: none;

  &:hover {
    background: ${(props) => props.theme.tertiaryBackground};
  }
`;

const StyledButtonLabel = styled.div`
  font-weight: 500;
  margin-left: ${(props) => props.theme.spacing(2)};
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
