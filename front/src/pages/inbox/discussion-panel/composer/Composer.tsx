import styled from '@emotion/styled';
import ComposerSwitch from './ComposerSwitch';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 2px solid #000000;
  border-radius: 12px;
`;

const StyledInputContainer = styled.div`
  display: flex;
  padding: 8px;
  justify-content: center;
  & > textarea {
    width: 95%;
    border: none;
    outline: none;
    font-family: 'Source Sans Pro';

    &::placeholder {
      font-family: 'Source Sans Pro';
    }
  }
`;

const ActionContainer = styled.div`
  display: flex;
  padding: 16px;
  justify-content: flex-end;
`;

const PrimaryButton = styled.button`
  background: black;
  font-weight: bold;
  color: white;
  padding: 16px 24px;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
`;

function Composer() {
  return (
    <StyledContainer>
      <ComposerSwitch />
      <StyledInputContainer>
        <textarea rows={5} placeholder="Type to chat..."></textarea>
      </StyledInputContainer>
      <ActionContainer>
        <PrimaryButton>Reply by SMS</PrimaryButton>
      </ActionContainer>
    </StyledContainer>
  );
}

export default Composer;
