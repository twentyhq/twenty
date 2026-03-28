import { AGENT_CHAT_ENSURE_THREAD_FOR_DRAFT_EVENT_NAME } from '@/ai/constants/AgentChatEnsureThreadForDraftEventName';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useCreateAgentChatThread } from '@/ai/hooks/useCreateAgentChatThread';
import { useEnsureAgentChatThreadExistsForDraft } from '@/ai/hooks/useEnsureAgentChatThreadExistsForDraft';
import { useEnsureAgentChatThreadIdForSend } from '@/ai/hooks/useEnsureAgentChatThreadIdForSend';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { agentChatIsStreamingState } from '@/ai/states/agentChatIsStreamingState';
import { normalizeAiSdkError } from '@/ai/utils/normalizeAiSdkError';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { agentChatThreadsLoadingState } from '@/ai/states/agentChatThreadsLoadingState';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatFetchedMessagesComponentFamilyState } from '@/ai/states/agentChatFetchedMessagesComponentFamilyState';
import { agentChatIsInitialScrollPendingOnThreadChangeState } from '@/ai/states/agentChatIsInitialScrollPendingOnThreadChangeState';
import { mergeAgentChatFetchedAndStreamingMessages } from '@/ai/utils/mergeAgentChatFetchedAndStreamingMessages';
import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCallback, useEffect } from 'react';

export const AgentChatAiSdkStreamEffect = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);
  const agentChatFetchedMessages = useAtomComponentFamilyStateValue(
    agentChatFetchedMessagesComponentFamilyState,
    { threadId: currentAIChatThread },
  );

  const { createChatThread } = useCreateAgentChatThread();

  const { ensureThreadExistsForDraft } =
    useEnsureAgentChatThreadExistsForDraft(createChatThread);

  const { ensureThreadIdForSend } =
    useEnsureAgentChatThreadIdForSend(createChatThread);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_ENSURE_THREAD_FOR_DRAFT_EVENT_NAME,
    onBrowserEvent: ensureThreadExistsForDraft,
  });

  const onStreamingComplete = useCallback(() => {
    dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
  }, []);

  const chatState = useAgentChat(
    agentChatFetchedMessages,
    ensureThreadIdForSend,
    onStreamingComplete,
  );

  const setAgentChatMessages = useSetAtomComponentFamilyState(
    agentChatMessagesComponentFamilyState,
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
    const mergedMessages = mergeAgentChatFetchedAndStreamingMessages(
      agentChatFetchedMessages,
      chatState.messages,
    );
    setAgentChatMessages(mergedMessages);

    if (currentAIChatThread !== agentChatDisplayedThread) {
      if (mergedMessages.length > 0) {
        setAgentChatIsInitialScrollPendingOnThreadChange(true);
      }
      setAgentChatDisplayedThread(currentAIChatThread);
    }
  }, [
    agentChatFetchedMessages,
    chatState.messages,
    chatState.status,
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

  useEffect(() => {
    const combinedIsLoading =
      chatState.isLoading ||
      agentChatMessagesLoading ||
      agentChatThreadsLoading;

    setAgentChatIsLoading(combinedIsLoading);
  }, [
    chatState.isLoading,
    agentChatMessagesLoading,
    agentChatThreadsLoading,
    setAgentChatIsLoading,
  ]);

  const setAgentChatError = useSetAtomState(agentChatErrorState);

  useEffect(() => {
    setAgentChatError(normalizeAiSdkError(chatState.error));
  }, [chatState.error, setAgentChatError]);

  const setAgentChatIsStreaming = useSetAtomState(agentChatIsStreamingState);

  useEffect(() => {
    setAgentChatIsStreaming(chatState.status === 'streaming');
  }, [chatState.status, setAgentChatIsStreaming]);

  return null;
};
