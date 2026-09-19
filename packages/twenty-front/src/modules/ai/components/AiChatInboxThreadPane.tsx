import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatPageCloseAskAiPanelEffect } from '@/ai/components/AiChatPageCloseAskAiPanelEffect';
import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';

const StyledPane = styled.div`
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

const StyledChatContainer = styled.div`
  --ai-chat-content-max-width: 768px;

  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

type AiChatInboxThreadPaneProps = {
  onBackToList?: () => void;
};

// The chat beside the inbox list. Unlike a channel's pane this starts no
// draft: the inbox is a view over threads that already exist, and a new chat
// belongs to whatever channel or direct conversation it is started from.
export const AiChatInboxThreadPane = ({
  onBackToList,
}: AiChatInboxThreadPaneProps) => {
  return (
    <StyledPane>
      <AiChatPageThreadUrlSyncEffect />
      <AiChatPageCloseAskAiPanelEffect />
      <AiChatPageContinueInSidePanelEffect />
      <AiChatPageHeader
        showNavigationDrawerCollapseButton={false}
        onBackToList={onBackToList}
      />
      <StyledChatContainer>
        <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.PAGE}>
          <AiChatTab />
        </AiChatSurfaceContext.Provider>
      </StyledChatContainer>
    </StyledPane>
  );
};
