import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { agentChatIsAwaitingFirstChunkComponentFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkComponentFamilyState';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { agentChatThreadsLoadingState } from '@/ai/states/agentChatThreadsLoadingState';
import { agentChatHasMessageComponentSelector } from '@/ai/states/selectors/agentChatHasMessageComponentSelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useShouldShowAiChatEmptyState = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatError = useAtomComponentFamilyStateValue(
    agentChatErrorComponentFamilyState,
    { threadId: currentAiChatThread },
  );
  const agentChatIsAwaitingFirstChunk = useAtomComponentFamilyStateValue(
    agentChatIsAwaitingFirstChunkComponentFamilyState,
    { threadId: currentAiChatThread },
  );
  const agentChatIsStreaming = useAtomComponentFamilyStateValue(
    agentChatIsStreamingComponentFamilyState,
    { threadId: currentAiChatThread },
  );
  const agentChatThreadsLoading = useAtomStateValue(
    agentChatThreadsLoadingState,
  );

  const hasMessages = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

  const isMobile = useIsMobile();

  const isOnNewChatSlot =
    currentAiChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY;

  return (
    isOnNewChatSlot &&
    !isMobile &&
    !hasMessages &&
    !isDefined(agentChatError) &&
    !agentChatThreadsLoading &&
    !agentChatIsAwaitingFirstChunk &&
    !agentChatIsStreaming
  );
};
