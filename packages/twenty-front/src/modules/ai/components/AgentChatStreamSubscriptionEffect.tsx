import { useEffect } from 'react';
import { isValidUuid } from 'twenty-shared/utils';

import { AGENT_CHAT_ENSURE_THREAD_FOR_DRAFT_EVENT_NAME } from '@/ai/constants/AgentChatEnsureThreadForDraftEventName';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useAgentChatSubscription } from '@/ai/hooks/useAgentChatSubscription';
import { useEnsureAgentChatThreadExistsForDraft } from '@/ai/hooks/useEnsureAgentChatThreadExistsForDraft';
import { useEnsureAgentChatThreadIdForSend } from '@/ai/hooks/useEnsureAgentChatThreadIdForSend';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatFetchedMessagesComponentFamilyState } from '@/ai/states/agentChatFetchedMessagesComponentFamilyState';
import { agentChatIsAwaitingFirstChunkComponentFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkComponentFamilyState';
import { agentChatIsAwaitingPersistedRefetchComponentFamilyState } from '@/ai/states/agentChatIsAwaitingPersistedRefetchComponentFamilyState';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AgentChatStreamSubscriptionEffect = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const { ensureThreadExistsForDraft } =
    useEnsureAgentChatThreadExistsForDraft();
  const { ensureThreadIdForSend } = useEnsureAgentChatThreadIdForSend();

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_ENSURE_THREAD_FOR_DRAFT_EVENT_NAME,
    onBrowserEvent: ensureThreadExistsForDraft,
  });

  useAgentChat(ensureThreadIdForSend);

  const subscriptionThreadId =
    currentAiChatThread !== null && isValidUuid(currentAiChatThread)
      ? currentAiChatThread
      : null;

  useAgentChatSubscription(subscriptionThreadId);

  const agentChatFetchedMessages = useAtomComponentFamilyStateValue(
    agentChatFetchedMessagesComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  const setAgentChatMessages = useSetAtomComponentFamilyState(
    agentChatMessagesComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  const agentChatIsStreaming = useAtomComponentFamilyStateValue(
    agentChatIsStreamingComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  const agentChatIsAwaitingPersistedRefetch = useAtomComponentFamilyStateValue(
    agentChatIsAwaitingPersistedRefetchComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  const agentChatIsAwaitingFirstChunk = useAtomComponentFamilyStateValue(
    agentChatIsAwaitingFirstChunkComponentFamilyState,
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
