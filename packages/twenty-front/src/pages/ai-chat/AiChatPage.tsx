import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { InboxCloseButton } from '@/ai/components/AiChatCloseButton';
import { useIsOnNewInboxSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { getDisplayedInboxThreadId } from '@/ai/utils/getDisplayedAiChatThreadId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { InboxNewThreadPageContent } from '~/pages/ai-chat/AiChatNewThreadPageContent';
import { InboxThreadPageEffects } from '~/pages/ai-chat/AiChatPageEffects';
import { InboxThreadPageContent } from '~/pages/ai-chat/AiChatThreadPageContent';

export const InboxThreadPage = () => {
  const { threadId } = useParams();
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const isOnNewInboxSlot = useIsOnNewInboxSlot();
  const isMobile = useIsMobile();
  const displayedThreadId = getDisplayedInboxThreadId({
    urlThreadId: threadId,
    currentInboxThread,
    isOnNewInboxSlot,
  });

  return (
    <>
      <InboxThreadPageEffects />
      {isDefined(displayedThreadId) ? (
        <InboxThreadPageContent
          threadId={displayedThreadId}
          headerActions={isMobile && <InboxCloseButton />}
        />
      ) : (
        // A new chat has no record until its first message is sent
        <InboxNewThreadPageContent />
      )}
    </>
  );
};
