import styled from '@emotion/styled';
import ActionBarButton from './ActionBarButton';
import { FaTrash } from 'react-icons/fa';

type OwnProps = {
  onDeleteClick: () => void;
};

const StyledContainer = styled.div`
  display: flex;
  position: absolute;
  z-index: 1;
  height: 48px;
  bottom: 38px;
  background: ${(props) => props.theme.secondaryBackground};
  align-items: center;
  padding-left: ${(props) => props.theme.spacing(4)};
  padding-right: ${(props) => props.theme.spacing(4)};
  color: ${(props) => props.theme.red};
  left: 50%;
  transform: translateX(-50%);

  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.primaryBorder};
`;

function ActionBar({ onDeleteClick }: OwnProps) {
  return (
    <StyledContainer>
      <ActionBarButton
        label="Delete"
        icon={<FaTrash />}
        onClick={onDeleteClick}
      />
    </StyledContainer>
  );
}

export default ActionBar;
