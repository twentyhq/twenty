import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { getDisplayedAiChatThreadId } from '@/ai/utils/getDisplayedAiChatThreadId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AiChatNewThreadPageContent } from '~/pages/ai-chat/AiChatNewThreadPageContent';
import { AiChatPageEffects } from '~/pages/ai-chat/AiChatPageEffects';
import { AiChatThreadPageContent } from '~/pages/ai-chat/AiChatThreadPageContent';

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
        <AiChatNewThreadPageContent />
      )}
    </>
  );
};
