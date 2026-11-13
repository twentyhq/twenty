import { useEffect } from 'react';

import { useAiChat } from '@/ai/hooks/useAgentChat';
import { useAiChatSubscription } from '@/ai/hooks/useAgentChatSubscription';
import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { aiChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { aiChatFetchedMessagesFamilyState } from '@/ai/states/agentChatFetchedMessagesFamilyState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { aiChatIsAwaitingPersistedRefetchFamilyState } from '@/ai/states/agentChatIsAwaitingPersistedRefetchFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { aiChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AiChatStreamSubscriptionEffect = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();

  useAiChat();

  useAiChatSubscription(isOnNewAiChatSlot ? null : currentAiChatThread);

  const aiChatFetchedMessages = useAtomFamilyStateValue(
    aiChatFetchedMessagesFamilyState,
    { threadId: currentAiChatThread },
  );

  const setAiChatMessages = useSetAtomFamilyState(aiChatMessagesFamilyState, {
    threadId: currentAiChatThread,
  });

  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId: currentAiChatThread },
  );

  const aiChatIsAwaitingPersistedRefetch = useAtomFamilyStateValue(
    aiChatIsAwaitingPersistedRefetchFamilyState,
    { threadId: currentAiChatThread },
  );

  const aiChatIsAwaitingFirstChunk = useAtomFamilyStateValue(
    aiChatIsAwaitingFirstChunkFamilyState,
    { threadId: currentAiChatThread },
  );

  const aiChatDisplayedThread = useAtomStateValue(aiChatDisplayedThreadState);

  const setAiChatDisplayedThread = useSetAtomState(aiChatDisplayedThreadState);

  useEffect(() => {
    if (aiChatIsStreaming) {
      return;
    }

    const isThreadSwitch = currentAiChatThread !== aiChatDisplayedThread;

    if (
      !isThreadSwitch &&
      (aiChatIsAwaitingPersistedRefetch || aiChatIsAwaitingFirstChunk)
    ) {
      return;
    }

    if (isThreadSwitch && aiChatIsAwaitingFirstChunk) {
      setAiChatDisplayedThread(currentAiChatThread);

      return;
    }

    setAiChatMessages(aiChatFetchedMessages);

    if (isThreadSwitch) {
      setAiChatDisplayedThread(currentAiChatThread);
    }
  }, [
    aiChatFetchedMessages,
    aiChatIsStreaming,
    aiChatIsAwaitingPersistedRefetch,
    aiChatIsAwaitingFirstChunk,
    setAiChatMessages,
    currentAiChatThread,
    aiChatDisplayedThread,
    setAiChatDisplayedThread,
  ]);

  return null;
};
