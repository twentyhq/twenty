import { styled } from '@linaria/react';
import { InboxTab } from '@/ai/components/AiChatTab';
import { INBOX_SURFACE } from '@/ai/constants/AiChatSurface';
import { InboxSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const SidePanelAskAiPage = () => {
  return (
    <InboxSurfaceContext.Provider value={INBOX_SURFACE.SIDE_PANEL}>
      <StyledContainer>
        <InboxTab />
      </StyledContainer>
    </InboxSurfaceContext.Provider>
  );
};
