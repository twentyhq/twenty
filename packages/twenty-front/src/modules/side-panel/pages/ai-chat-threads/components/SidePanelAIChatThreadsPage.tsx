import { ai-chat-threadsList } from '@/ai/components/ai-chat-threadsList';
import { styled } from '@linaria/react';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const SidePanelai-chat-threadsPage = () => {
  return (
    <StyledContainer>
      <ai-chat-threadsList />
    </StyledContainer>
  );
};
