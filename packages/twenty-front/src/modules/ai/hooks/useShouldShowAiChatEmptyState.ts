import { isDefined } from 'twenty-shared/utils';

import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { aiChatErrorFamilyState } from '@/ai/states/aiChatErrorFamilyState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/aiChatIsAwaitingFirstChunkFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { inboxRecentThreadsLoadingSelector } from '@/inbox/states/selectors/inboxRecentThreadsLoadingSelector';
import { aiChatHasMessageSelector } from '@/ai/states/selectors/aiChatHasMessageSelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useIsMobile } from 'twenty-ui/utilities';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useShouldShowAiChatEmptyState = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId: currentAiChatThread,
  });
  const aiChatIsAwaitingFirstChunk = useAtomFamilyStateValue(
    aiChatIsAwaitingFirstChunkFamilyState,
    { threadId: currentAiChatThread },
  );
  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId: currentAiChatThread },
  );
  const inboxRecentThreadsLoading = useAtomStateValue(
    inboxRecentThreadsLoadingSelector,
  );

  const aiChatHasMessage = useAtomStateValue(aiChatHasMessageSelector);

  const isMobile = useIsMobile();

  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();

  return (
    isOnNewAiChatSlot &&
    !isMobile &&
    !aiChatHasMessage &&
    !isDefined(aiChatError) &&
    !inboxRecentThreadsLoading &&
    !aiChatIsAwaitingFirstChunk &&
    !aiChatIsStreaming
  );
};
