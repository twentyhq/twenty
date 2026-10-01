import { styled } from '@linaria/react';
import { useParams } from 'react-router-dom';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { AiChatPageCloseSidePanelChatEffect } from '@/ai/components/AiChatPageCloseSidePanelChatEffect';
import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { getDisplayedAiChatThreadId } from '@/ai/utils/getDisplayedAiChatThreadId';
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
  const isMobile = useIsMobile();
  const displayedThreadId = getDisplayedAiChatThreadId({
    urlThreadId: threadId,
    currentAiChatThread,
  });

  return (
    <>
      <AiChatPageThreadUrlSyncEffect />
      <AiChatPageCloseSidePanelChatEffect />
      <AiChatPageContinueInSidePanelEffect />
      {isDefined(displayedThreadId) ? (
        <RecordShowPageContent
          parameters={{
            objectNameSingular: CoreObjectNameSingular.AgentChatThread,
            objectRecordId: displayedThreadId,
          }}
          headerActions={isMobile && <AiChatCloseButton />}
          headerTitleMode="record-title"
          isRecordIdentifierBarHidden
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
