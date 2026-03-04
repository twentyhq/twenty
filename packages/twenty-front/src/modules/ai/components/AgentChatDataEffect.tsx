import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useAgentChatData } from '@/ai/hooks/useAgentChatData';
import { useAgentChatScrollToBottom } from '@/ai/hooks/useAgentChatScrollToBottom';
import { useProcessIncrementalStreamMessages } from '@/ai/hooks/useProcessIncrementalStreamMessages';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { agentChatIsStreamingState } from '@/ai/states/agentChatIsStreamingState';
import { agentChatMessagesComponentState } from '@/ai/states/agentChatMessagesComponentState';
import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';

export const AgentChatDataEffect = () => {
  const { uiMessages, isLoading } = useAgentChatData();
  const chatState = useAgentChat(uiMessages);

  const combinedIsLoading = chatState.isLoading || isLoading;
  const isStreaming = chatState.status === 'streaming';

  const setAgentChatIsLoading = useSetAtomState(agentChatIsLoadingState);
  const setAgentChatMessages = useSetAtomComponentState(
    agentChatMessagesComponentState,
  );
  const setAgentChatError = useSetAtomState(agentChatErrorState);

  const [agentChatUISessionStartTime, setAgentChatUISessionStartTime] =
    useAtomState(agentChatUISessionStartTimeState);

  useEffect(() => {
    setAgentChatIsLoading(combinedIsLoading);
  }, [combinedIsLoading, setAgentChatIsLoading]);

  useEffect(() => {
    setAgentChatMessages(chatState.messages);
  }, [chatState.messages, setAgentChatMessages]);

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

  const incrementalStreamMessages = chatState.messages;

  const { scrollToBottom, isNearBottom } = useAgentChatScrollToBottom();

  const { processIncrementalStreamMessages } =
    useProcessIncrementalStreamMessages();

  useEffect(() => {
    if (incrementalStreamMessages.length === 0) {
      return;
    }

    if (isNearBottom) {
      scrollToBottom();
    }

    processIncrementalStreamMessages(incrementalStreamMessages);
  }, [
    incrementalStreamMessages,
    scrollToBottom,
    isNearBottom,
    processIncrementalStreamMessages,
  ]);

  return null;
};
