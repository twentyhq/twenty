import styled from '@emotion/styled';
import { ReactNode } from 'react';

type OwnProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

const StyledButton = styled.div`
  display: flex;
  cursor: pointer;

  justify-content: center;

  padding: ${(props) => props.theme.spacing(2)};
  border-radius: 4px;

  &:hover {
    background: ${(props) => props.theme.tertiaryBackground};
  }
`;

const StyledButtonabel = styled.div`
  margin-left: ${(props) => props.theme.spacing(2)};
`;

function ActionBarButton({ label, icon, onClick }: OwnProps) {
  return (
    <StyledButton onClick={onClick}>
      {icon}
      <StyledButtonabel>{label}</StyledButtonabel>
    </StyledButton>
  );
}

export default ActionBarButton;
