import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useAgentChatData } from '@/ai/hooks/useAgentChatData';
import { useAgentChatScrollToBottom } from '@/ai/hooks/useAgentChatScrollToBottom';
import { useProcessIncrementalStreamMessages } from '@/ai/hooks/useProcessIncrementalStreamMessages';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { agentChatIsStreamingState } from '@/ai/states/agentChatIsStreamingState';
import { agentChatMessagesComponentState } from '@/ai/states/agentChatMessagesComponentState';
import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';

export const AgentChatDataEffect = () => {
  const { uiMessages, isLoading, ensureThreadIdForSend } = useAgentChatData();
  const chatState = useAgentChat(uiMessages, ensureThreadIdForSend);

  const combinedIsLoading = chatState.isLoading || isLoading;
  const isStreaming = chatState.status === 'streaming';

  const setAgentChatIsLoading = useSetAtomState(agentChatIsLoadingState);
  const setAgentChatError = useSetAtomState(agentChatErrorState);

  const [agentChatUISessionStartTime, setAgentChatUISessionStartTime] =
    useAtomState(agentChatUISessionStartTimeState);

  const [, setAgentChatMessages] = useAtomComponentState(
    agentChatMessagesComponentState,
  );

  useEffect(() => {
    setAgentChatMessages(chatState.messages);
  }, [chatState.messages, setAgentChatMessages]);

  useEffect(() => {
    setAgentChatIsLoading(combinedIsLoading);
  }, [combinedIsLoading, setAgentChatIsLoading]);

  useEffect(() => {
    setAgentChatError(chatState.error);
  }, [chatState.error, setAgentChatError]);

  useEffect(() => {
    if (agentChatUISessionStartTime === null) {
      setAgentChatUISessionStartTime(Temporal.Now.instant());
    }
  }, [agentChatUISessionStartTime, setAgentChatUISessionStartTime]);

  const setAgentChatIsStreaming = useSetAtomState(agentChatIsStreamingState);

  useEffect(() => {
    setAgentChatIsStreaming(isStreaming);
  }, [setAgentChatIsStreaming, isStreaming]);

  const { scrollToBottom, isNearBottom } = useAgentChatScrollToBottom();

  const { processIncrementalStreamMessages } =
    useProcessIncrementalStreamMessages();

  useEffect(() => {
    if (chatState.messages.length === 0) {
      return;
    }

    if (isNearBottom) {
      scrollToBottom();
    }

    processIncrementalStreamMessages(chatState.messages);
  }, [
    chatState.messages,
    scrollToBottom,
    isNearBottom,
    processIncrementalStreamMessages,
  ]);

  return null;
};
