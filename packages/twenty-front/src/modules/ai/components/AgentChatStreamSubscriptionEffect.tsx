import { useCallback, useEffect } from 'react';
import { isValidUuid } from 'twenty-shared/utils';

import { AGENT_CHAT_ENSURE_THREAD_FOR_DRAFT_EVENT_NAME } from '@/ai/constants/AgentChatEnsureThreadForDraftEventName';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useAgentChatSubscription } from '@/ai/hooks/useAgentChatSubscription';
import { useCreateAgentChatThread } from '@/ai/hooks/useCreateAgentChatThread';
import { useEnsureAgentChatThreadExistsForDraft } from '@/ai/hooks/useEnsureAgentChatThreadExistsForDraft';
import { useEnsureAgentChatThreadIdForSend } from '@/ai/hooks/useEnsureAgentChatThreadIdForSend';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatFetchedMessagesComponentFamilyState } from '@/ai/states/agentChatFetchedMessagesComponentFamilyState';
import { agentChatIsInitialScrollPendingOnThreadChangeState } from '@/ai/states/agentChatIsInitialScrollPendingOnThreadChangeState';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { agentChatThreadsLoadingState } from '@/ai/states/agentChatThreadsLoadingState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AgentChatStreamSubscriptionEffect = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);

  const { createChatThread } = useCreateAgentChatThread();

  const { ensureThreadExistsForDraft } =
    useEnsureAgentChatThreadExistsForDraft(createChatThread);

  const { ensureThreadIdForSend } =
    useEnsureAgentChatThreadIdForSend(createChatThread);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_ENSURE_THREAD_FOR_DRAFT_EVENT_NAME,
    onBrowserEvent: ensureThreadExistsForDraft,
  });

  useAgentChat(ensureThreadIdForSend);

  const subscriptionThreadId =
    currentAIChatThread !== null && isValidUuid(currentAIChatThread)
      ? currentAIChatThread
      : null;

  useAgentChatSubscription(subscriptionThreadId);

  const agentChatFetchedMessages = useAtomComponentFamilyStateValue(
    agentChatFetchedMessagesComponentFamilyState,
    { threadId: currentAIChatThread },
  );

  const setAgentChatMessages = useSetAtomComponentFamilyState(
    agentChatMessagesComponentFamilyState,
    { threadId: currentAIChatThread },
  );

  const agentChatIsStreaming = useAtomComponentFamilyStateValue(
    agentChatIsStreamingComponentFamilyState,
    { threadId: currentAIChatThread },
  );

  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );

  const setAgentChatDisplayedThread = useSetAtomState(
    agentChatDisplayedThreadState,
  );

  const setAgentChatIsInitialScrollPendingOnThreadChange = useSetAtomState(
    agentChatIsInitialScrollPendingOnThreadChangeState,
  );

  useEffect(() => {
    if (agentChatIsStreaming) {
      return;
    }

    setAgentChatMessages(agentChatFetchedMessages);

    if (currentAIChatThread !== agentChatDisplayedThread) {
      if (agentChatFetchedMessages.length > 0) {
        setAgentChatIsInitialScrollPendingOnThreadChange(true);
      }
      setAgentChatDisplayedThread(currentAIChatThread);
    }
  }, [
    agentChatFetchedMessages,
    agentChatIsStreaming,
    setAgentChatMessages,
    currentAIChatThread,
    agentChatDisplayedThread,
    setAgentChatDisplayedThread,
    setAgentChatIsInitialScrollPendingOnThreadChange,
  ]);

  const setAgentChatIsLoading = useSetAtomState(agentChatIsLoadingState);
  const agentChatThreadsLoading = useAtomStateValue(
    agentChatThreadsLoadingState,
  );
  const agentChatMessagesLoading = useAtomStateValue(
    agentChatMessagesLoadingState,
  );

  const handleLoadingChange = useCallback(() => {
    const combinedIsLoading =
      agentChatMessagesLoading || agentChatThreadsLoading;

    setAgentChatIsLoading(combinedIsLoading);
  }, [
    agentChatMessagesLoading,
    agentChatThreadsLoading,
    setAgentChatIsLoading,
  ]);

  useEffect(() => {
    handleLoadingChange();
  }, [handleLoadingChange]);

  return null;
};
