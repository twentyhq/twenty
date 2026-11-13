import { styled } from '@linaria/react';
import { useState } from 'react';

import { InboxTab } from '@/ai/components/InboxTab';
import { INBOX_SURFACE } from '@/ai/constants/InboxSurface';
import { InboxSurfaceContext } from '@/ai/contexts/InboxSurfaceContext';
import { ChatWidgetOpenInChatPageEffect } from '@/page-layout/widgets/chat/components/ChatWidgetOpenInChatPageEffect';
import { ChatWidgetThreadSyncEffect } from '@/page-layout/widgets/chat/components/ChatWidgetThreadSyncEffect';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { isCurrentPathInboxThreadPage } from '~/utils/isCurrentPathInboxThreadPage';

const StyledChatContainer = styled.div`
  --ai-chat-content-max-width: 768px;

  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
`;

export const ChatWidget = () => {
  const targetRecord = useTargetRecord();
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  // Checked once so leaving for the chat page later does not pull this chat into it
  const [isOpenedBesideChatPage] = useState(
    () => isInSidePanel && isCurrentPathInboxThreadPage(),
  );

  if (isOpenedBesideChatPage) {
    return <ChatWidgetOpenInChatPageEffect threadId={targetRecord.id} />;
  }

  return (
    <StyledChatContainer>
      <ChatWidgetThreadSyncEffect threadId={targetRecord.id} />
      <InboxSurfaceContext.Provider
        value={isInSidePanel ? INBOX_SURFACE.SIDE_PANEL : INBOX_SURFACE.PAGE}
      >
        <InboxTab />
      </InboxSurfaceContext.Provider>
    </StyledChatContainer>
  );
};
