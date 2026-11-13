import { isDefined } from 'twenty-shared/utils';

import { useIsOnNewInboxSlot } from '@/ai/hooks/useIsOnNewInboxSlot';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { inboxRecentThreadsLoadingSelector } from '@/ai/states/selectors/inboxRecentThreadsLoadingSelector';
import { inboxHasMessageSelector } from '@/ai/states/selectors/inboxHasMessageSelector';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { useIsMobile } from 'twenty-ui/utilities';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useShouldShowInboxEmptyState = () => {
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const agentChatError = useAtomFamilyStateValue(agentChatErrorFamilyState, {
    threadId: currentInboxThread,
  });
  const agentChatIsAwaitingFirstChunk = useAtomFamilyStateValue(
    agentChatIsAwaitingFirstChunkFamilyState,
    { threadId: currentInboxThread },
  );
  const agentChatIsStreaming = useAtomFamilyStateValue(
    agentChatIsStreamingFamilyState,
    { threadId: currentInboxThread },
  );
  const inboxRecentThreadsLoading = useAtomStateValue(
    inboxRecentThreadsLoadingSelector,
  );

  const inboxHasMessage = useAtomStateValue(inboxHasMessageSelector);

  const isMobile = useIsMobile();

  const isOnNewInboxSlot = useIsOnNewInboxSlot();

  return (
    isOnNewInboxSlot &&
    !isMobile &&
    !inboxHasMessage &&
    !isDefined(agentChatError) &&
    !inboxRecentThreadsLoading &&
    !agentChatIsAwaitingFirstChunk &&
    !agentChatIsStreaming
  );
};
