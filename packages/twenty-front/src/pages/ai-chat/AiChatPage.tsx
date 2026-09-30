import { styled } from '@linaria/react';

import { AiChatPageCloseAskAiPanelEffect } from '@/ai/components/AiChatPageCloseAskAiPanelEffect';
import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { AiChatPageDeletedThreadBanner } from '@/ai/components/AiChatPageDeletedThreadBanner';
import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';

const StyledChatContainer = styled.div`
  --ai-chat-content-max-width: 768px;

  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

export const AiChatPage = () => {
  return (
    <>
      <AiChatPageThreadUrlSyncEffect />
      <AiChatPageCloseAskAiPanelEffect />
      <AiChatPageContinueInSidePanelEffect />
      <PageCardLayout header={<AiChatPageHeader />}>
        <AiChatPageDeletedThreadBanner />
        <StyledChatContainer>
          <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.PAGE}>
            <AiChatTab />
          </AiChatSurfaceContext.Provider>
        </StyledChatContainer>
      </PageCardLayout>
    </>
  );
};
