import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatChannelDraftThreadEffect } from '@/ai/components/AiChatChannelDraftThreadEffect';
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

type AiChatChannelThreadPaneProps = {
  channelId: string;
  onBackToList?: () => void;
};

// The chat beside a channel's thread list: the thread named in the URL, or a
// new chat of the channel when the URL names none.
export const AiChatChannelThreadPane = ({
  channelId,
  onBackToList,
}: AiChatChannelThreadPaneProps) => {
  return (
    <StyledPane>
      <AiChatPageThreadUrlSyncEffect channelId={channelId} />
      <AiChatChannelDraftThreadEffect channelId={channelId} />
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
