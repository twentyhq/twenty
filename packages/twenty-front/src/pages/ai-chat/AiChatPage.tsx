import { styled } from '@linaria/react';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { getDisplayedAiChatThreadId } from '@/ai/utils/getDisplayedAiChatThreadId';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AiChatPageEffects } from '~/pages/ai-chat/AiChatPageEffects';
import { AiChatThreadPageContent } from '~/pages/ai-chat/AiChatThreadPageContent';

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
  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();
  const isMobile = useIsMobile();
  const displayedThreadId = getDisplayedAiChatThreadId({
    urlThreadId: threadId,
    currentAiChatThread,
    isOnNewAiChatSlot,
  });

  return (
    <>
      <AiChatPageEffects />
      {isDefined(displayedThreadId) ? (
        <AiChatThreadPageContent
          threadId={displayedThreadId}
          headerActions={isMobile && <AiChatCloseButton />}
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
