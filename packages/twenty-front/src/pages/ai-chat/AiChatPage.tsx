import { styled } from '@linaria/react';
import { useParams } from 'react-router-dom';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { AiChatPageCloseAskAiPanelEffect } from '@/ai/components/AiChatPageCloseAskAiPanelEffect';
import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { RecordShowPageContent } from '~/pages/object-record/RecordShowPage';

const StyledChatContainer = styled.div`
  --ai-chat-content-max-width: 768px;

  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

export const AiChatPage = () => {
  const { threadId } = useParams();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  // /chat without an id shows the current chat, which starts as the most
  // recent one
  const displayedThreadId =
    isDefined(threadId) && isValidUuid(threadId)
      ? threadId
      : isDefined(currentAiChatThread) && isValidUuid(currentAiChatThread)
        ? currentAiChatThread
        : null;

  return (
    <>
      <AiChatPageThreadUrlSyncEffect />
      <AiChatPageCloseAskAiPanelEffect />
      <AiChatPageContinueInSidePanelEffect />
      {isDefined(displayedThreadId) ? (
        <RecordShowPageContent
          parameters={{
            objectNameSingular: CoreObjectNameSingular.AgentChatThread,
            objectRecordId: displayedThreadId,
          }}
        />
      ) : (
        // A new chat has no record until its first message is sent
        <PageCardLayout header={<AiChatPageHeader />}>
          <StyledChatContainer>
            <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.PAGE}>
              <AiChatTab />
            </AiChatSurfaceContext.Provider>
          </StyledChatContainer>
        </PageCardLayout>
      )}
    </>
  );
};
