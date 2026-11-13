import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { InboxCloseButton } from '@/ai/components/InboxCloseButton';
import { useIsOnNewInboxSlot } from '@/ai/hooks/useIsOnNewInboxSlot';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { getDisplayedInboxThreadId } from '@/ai/utils/getDisplayedInboxThreadId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { InboxNewThreadPageContent } from '~/pages/ai-chat/InboxNewThreadPageContent';
import { InboxThreadPageEffects } from '~/pages/ai-chat/InboxThreadPageEffects';
import { InboxThreadPageContent } from '~/pages/ai-chat/InboxThreadPageContent';

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
