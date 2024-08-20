import styled from '@emotion/styled';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  overflow-y: auto;
  position: relative;
`;

const StyledChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  padding: ${({ theme }) => theme.spacing(6)};
  padding-bottom: 0px;
`;

const StyledNewMessageArea = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(6)};
  padding-top: 0px;
`;

export const RightDrawerWorkflow = () => {
  const handleCreateCodeBlock = () => {};

  return (
    <StyledContainer>
      <StyledChatArea>{/* TODO */}</StyledChatArea>
      <StyledNewMessageArea>
        <button onClick={handleCreateCodeBlock}>Create code block</button>
      </StyledNewMessageArea>
    </StyledContainer>
  );
};
