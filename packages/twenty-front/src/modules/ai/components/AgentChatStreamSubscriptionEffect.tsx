import { useEffect } from 'react';

import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useInboxSubscription } from '@/ai/hooks/useAgentChatSubscription';
import { useIsOnNewInboxSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { inboxDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { inboxFetchedMessagesFamilyState } from '@/ai/states/agentChatFetchedMessagesFamilyState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatIsAwaitingPersistedRefetchFamilyState } from '@/ai/states/agentChatIsAwaitingPersistedRefetchFamilyState';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { inboxMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AgentChatStreamSubscriptionEffect = () => {
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const isOnNewInboxSlot = useIsOnNewInboxSlot();

  useAgentChat();

  useInboxSubscription(isOnNewInboxSlot ? null : currentInboxThread);

  const inboxFetchedMessages = useAtomFamilyStateValue(
    inboxFetchedMessagesFamilyState,
    { threadId: currentInboxThread },
  );

  const setInboxMessages = useSetAtomFamilyState(inboxMessagesFamilyState, {
    threadId: currentInboxThread,
  });

  const agentChatIsStreaming = useAtomFamilyStateValue(
    agentChatIsStreamingFamilyState,
    { threadId: currentInboxThread },
  );

  const agentChatIsAwaitingPersistedRefetch = useAtomFamilyStateValue(
    agentChatIsAwaitingPersistedRefetchFamilyState,
    { threadId: currentInboxThread },
  );

  const agentChatIsAwaitingFirstChunk = useAtomFamilyStateValue(
    agentChatIsAwaitingFirstChunkFamilyState,
    { threadId: currentInboxThread },
  );

  const inboxDisplayedThread = useAtomStateValue(inboxDisplayedThreadState);

  const setInboxDisplayedThread = useSetAtomState(inboxDisplayedThreadState);

  useEffect(() => {
    if (agentChatIsStreaming) {
      return;
    }

    const isThreadSwitch = currentInboxThread !== inboxDisplayedThread;

    if (
      !isThreadSwitch &&
      (agentChatIsAwaitingPersistedRefetch || agentChatIsAwaitingFirstChunk)
    ) {
      return;
    }

    if (isThreadSwitch && agentChatIsAwaitingFirstChunk) {
      setInboxDisplayedThread(currentInboxThread);

      return;
    }

    setInboxMessages(inboxFetchedMessages);

    if (isThreadSwitch) {
      setInboxDisplayedThread(currentInboxThread);
    }
  }, [
    inboxFetchedMessages,
    agentChatIsStreaming,
    agentChatIsAwaitingPersistedRefetch,
    agentChatIsAwaitingFirstChunk,
    setInboxMessages,
    currentInboxThread,
    inboxDisplayedThread,
    setInboxDisplayedThread,
  ]);

  return null;
};
