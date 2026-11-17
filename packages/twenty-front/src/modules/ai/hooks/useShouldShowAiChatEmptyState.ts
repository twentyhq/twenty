import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAiChatInstance } from '@/ai/hooks/useAiChatInstance';
import { isDefined } from 'twenty-shared/utils';

import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { aiChatErrorFamilyState } from '@/ai/states/aiChatErrorFamilyState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/aiChatIsAwaitingFirstChunkFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { hasInitializedAiChatThreadsState } from '@/ai/states/hasInitializedAiChatThreadsState';
import { aiChatHasMessageComponentSelector } from '@/ai/states/selectors/aiChatHasMessageComponentSelector';
import { useIsMobile } from 'twenty-ui/utilities';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useShouldShowAiChatEmptyState = () => {
  const { threadId: currentAiChatThread } = useAiChatInstance();
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
  const hasInitializedAiChatThreads = useAtomStateValue(
    hasInitializedAiChatThreadsState,
  );

  const aiChatHasMessage = useAtomComponentSelectorValue(
    aiChatHasMessageComponentSelector,
  );

  const isMobile = useIsMobile();

  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();

  return (
    isOnNewAiChatSlot &&
    !isMobile &&
    !aiChatHasMessage &&
    !isDefined(aiChatError) &&
    hasInitializedAiChatThreads &&
    !aiChatIsAwaitingFirstChunk &&
    !aiChatIsStreaming
  );
};
