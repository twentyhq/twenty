import { AiChatThreadsList } from '@/ai/components/AiChatThreadsList';
import { styled } from '@linaria/react';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const SidePanelAiChatThreadsPage = () => {
  return (
    <StyledContainer>
      <AiChatThreadsList />
    </StyledContainer>
  );
};
