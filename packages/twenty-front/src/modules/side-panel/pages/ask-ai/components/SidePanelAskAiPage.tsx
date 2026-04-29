import { styled } from '@linaria/react';
import { AiChatTab } from '@/ai/components/AiChatTab';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const SidePanelAskAiPage = () => {
  return (
    <StyledContainer>
      <AiChatTab />
    </StyledContainer>
  );
};
