import { useEffect } from 'react';

import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useAgentChatSubscription } from '@/ai/hooks/useAgentChatSubscription';
import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatFetchedMessagesFamilyState } from '@/ai/states/agentChatFetchedMessagesFamilyState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatIsAwaitingPersistedRefetchFamilyState } from '@/ai/states/agentChatIsAwaitingPersistedRefetchFamilyState';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AgentChatStreamSubscriptionEffect = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();

  useAgentChat();

  useAgentChatSubscription(isOnNewAiChatSlot ? null : currentAiChatThread);

  const agentChatFetchedMessages = useAtomFamilyStateValue(
    agentChatFetchedMessagesFamilyState,
    { threadId: currentAiChatThread },
  );

  const setAgentChatMessages = useSetAtomFamilyState(
    agentChatMessagesFamilyState,
    { threadId: currentAiChatThread },
  );

  const agentChatIsStreaming = useAtomFamilyStateValue(
    agentChatIsStreamingFamilyState,
    { threadId: currentAiChatThread },
  );

  const agentChatIsAwaitingPersistedRefetch = useAtomFamilyStateValue(
    agentChatIsAwaitingPersistedRefetchFamilyState,
    { threadId: currentAiChatThread },
  );

  const agentChatIsAwaitingFirstChunk = useAtomFamilyStateValue(
    agentChatIsAwaitingFirstChunkFamilyState,
    { threadId: currentAiChatThread },
  );

  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );

  const setAgentChatDisplayedThread = useSetAtomState(
    agentChatDisplayedThreadState,
  );

  useEffect(() => {
    if (agentChatIsStreaming) {
      return;
    }

    const isThreadSwitch = currentAiChatThread !== agentChatDisplayedThread;

    if (
      !isThreadSwitch &&
      (agentChatIsAwaitingPersistedRefetch || agentChatIsAwaitingFirstChunk)
    ) {
      return;
    }

    if (isThreadSwitch && agentChatIsAwaitingFirstChunk) {
      setAgentChatDisplayedThread(currentAiChatThread);

      return;
    }

    setAgentChatMessages(agentChatFetchedMessages);

    if (isThreadSwitch) {
      setAgentChatDisplayedThread(currentAiChatThread);
    }
  }, [
    agentChatFetchedMessages,
    agentChatIsStreaming,
    agentChatIsAwaitingPersistedRefetch,
    agentChatIsAwaitingFirstChunk,
    setAgentChatMessages,
    currentAiChatThread,
    agentChatDisplayedThread,
    setAgentChatDisplayedThread,
  ]);

  return null;
};
