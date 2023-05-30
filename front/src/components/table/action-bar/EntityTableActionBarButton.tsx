import styled from '@emotion/styled';
import { ReactNode } from 'react';

type OwnProps = {
  icon: ReactNode;
  label: string;
  color?: 'default' | 'red';
  onClick: () => void;
};

const StyledButton = styled.div`
  display: flex;
  cursor: pointer;
  user-select: none;
  color: ${(props) =>
    props.color === 'default' ? props.theme.text60 : props.theme.red};
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
  color = 'default',
  onClick,
}: OwnProps) {
  return (
    <StyledButton color={color} onClick={onClick}>
      {icon}
      <StyledButtonLabel>{label}</StyledButtonLabel>
    </StyledButton>
  );
}
