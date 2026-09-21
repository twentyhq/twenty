import { styled } from '@linaria/react';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const SidePanelAskAiPage = () => {
  return (
    <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.SIDE_PANEL}>
      <StyledContainer>
        <AiChatTab />
      </StyledContainer>
    </AiChatSurfaceContext.Provider>
  );
};
