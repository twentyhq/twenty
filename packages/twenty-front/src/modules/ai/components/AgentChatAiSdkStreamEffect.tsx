import { AGENT_CHAT_ENSURE_THREAD_FOR_DRAFT_EVENT_NAME } from '@/ai/constants/AgentChatEnsureThreadForDraftEventName';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useCreateAgentChatThread } from '@/ai/hooks/useCreateAgentChatThread';
import { useEnsureAgentChatThreadExistsForDraft } from '@/ai/hooks/useEnsureAgentChatThreadExistsForDraft';
import { useEnsureAgentChatThreadIdForSend } from '@/ai/hooks/useEnsureAgentChatThreadIdForSend';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { agentChatIsStreamingState } from '@/ai/states/agentChatIsStreamingState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { agentChatThreadsLoadingState } from '@/ai/states/agentChatThreadsLoadingState';
import { agentChatUiMessagesState } from '@/ai/states/agentChatUiMessagesState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

export const AgentChatAiSdkStreamEffect = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);
  const agentChatUiMessages = useAtomStateValue(agentChatUiMessagesState);

  const { createChatThread } = useCreateAgentChatThread();

  const { ensureThreadExistsForDraft } =
    useEnsureAgentChatThreadExistsForDraft(createChatThread);

  const { ensureThreadIdForSend } =
    useEnsureAgentChatThreadIdForSend(createChatThread);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_ENSURE_THREAD_FOR_DRAFT_EVENT_NAME,
    onBrowserEvent: ensureThreadExistsForDraft,
  });

  const chatState = useAgentChat(agentChatUiMessages, ensureThreadIdForSend);

  const [, setAgentChatMessages] = useAtomComponentFamilyState(
    agentChatMessagesComponentFamilyState,
    { threadId: currentAIChatThread },
  );

  useEffect(() => {
    setAgentChatMessages(chatState.messages);
  }, [chatState.messages, chatState.status, setAgentChatMessages]);

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
    setAgentChatError(chatState.error);
  }, [chatState.error, setAgentChatError]);

  const setAgentChatIsStreaming = useSetAtomState(agentChatIsStreamingState);

  useEffect(() => {
    setAgentChatIsStreaming(chatState.status === 'streaming');
  }, [chatState.status, setAgentChatIsStreaming]);

  return null;
};
