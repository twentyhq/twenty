import { styled } from '@linaria/react';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatTab } from '@/ai/components/AiChatTab';
import { AiChatThreadRecordTargets } from '@/ai/components/AiChatThreadRecordTargets';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { ChatWidgetOpenInChatPageEffect } from '@/page-layout/widgets/chat/components/ChatWidgetOpenInChatPageEffect';
import { ChatWidgetThreadSyncEffect } from '@/page-layout/widgets/chat/components/ChatWidgetThreadSyncEffect';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

const StyledChatContainer = styled.div`
  --ai-chat-content-max-width: 768px;

  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
`;

const StyledRecordTargets = styled.div`
  box-sizing: border-box;
  margin: 0 auto;
  max-width: var(--ai-chat-content-max-width);
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]} 0;
  width: 100%;
`;

export const ChatWidget = () => {
  const targetRecord = useTargetRecord();
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  // Checked once so leaving for the chat page later does not pull this chat into it
  const [isOpenedBesideChatPage] = useState(
    () => isInSidePanel && isCurrentPathAiChatPage(),
  );

  if (isOpenedBesideChatPage) {
    return <ChatWidgetOpenInChatPageEffect threadId={targetRecord.id} />;
  }

  return (
    <StyledChatContainer>
      <ChatWidgetThreadSyncEffect threadId={targetRecord.id} />
      <StyledRecordTargets>
        <AiChatThreadRecordTargets
          threadId={targetRecord.id}
          instanceId={`chat-widget-record-targets-${targetRecord.id}`}
        />
      </StyledRecordTargets>
      <AiChatSurfaceContext.Provider
        value={
          isInSidePanel ? AI_CHAT_SURFACE.SIDE_PANEL : AI_CHAT_SURFACE.PAGE
        }
      >
        <AiChatTab />
      </AiChatSurfaceContext.Provider>
    </StyledChatContainer>
  );
};
