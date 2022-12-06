import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  border-bottom: 2px solid #eaecee;
  padding: 0px 12px;
`;

const SwitchTab = styled.button`
  display: flex;
  border-bottom: 2px solid #eaecee;
  margin-bottom: -2px;
  padding: 12px;
  cursor: pointer;
  color: #2e3138;
  background: inherit;
  border: 0;

  &:hover {
    border-bottom: 2px solid #2e3138;
  }
`;

const SwitchTabActive = styled.button`
  display: flex;
  border: 0;
  border-bottom: 2px solid black;
  margin-bottom: -2px;
  padding: 12px;
  cursor: pointer;
  color: black;
  font-weight: bold;
  background: inherit;
`;

function ComposerSwitch() {
  return (
    <StyledContainer>
      <SwitchTabActive>Reply</SwitchTabActive>
      <SwitchTab>Call</SwitchTab>
      <SwitchTab>Note</SwitchTab>
      <SwitchTab>Transfer</SwitchTab>
      <SwitchTab>Help</SwitchTab>
    </StyledContainer>
  );
}

export default ComposerSwitch;
