import { InputHotkeyScope } from '@/ui/input/types/InputHotkeyScope';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { STREAM_CHAT_QUERY } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/api/agent-chat-apollo.api';
import { AgentChatMessageRole } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/agent-chat-message-role';
import { useApolloClient } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { agentChatInputState } from '../states/agentChatInputState';
import { agentChatMessagesComponentState } from '../states/agentChatMessagesComponentState';
import { agentStreamingMessageState } from '../states/agentStreamingMessageState';
import { AgentChatMessage, useAgentChatMessages } from './useAgentChatMessages';
import { useAgentChatThreads } from './useAgentChatThreads';

interface OptimisticMessage extends AgentChatMessage {
  isPending: boolean;
}

export const useAgentChat = (agentId: string) => {
  const apolloClient = useApolloClient();

  const [agentChatMessages, setAgentChatMessages] = useRecoilComponentStateV2(
    agentChatMessagesComponentState,
    agentId,
  );

  const [agentChatInput, setAgentChatInput] =
    useRecoilState(agentChatInputState);

  const [agentStreamingMessage, setAgentStreamingMessage] = useRecoilState(
    agentStreamingMessageState,
  );

  const [isStreaming, setIsStreaming] = useState(false);

  const { scrollWrapperHTMLElement } = useScrollWrapperElement(agentId);

  const scrollToBottom = () => {
    scrollWrapperHTMLElement?.scroll({
      top: scrollWrapperHTMLElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  const { data: { threads = [] } = {}, loading: threadsLoading } =
    useAgentChatThreads(agentId);
  const currentThreadId = threads[0]?.id;

  const {
    data: messagesData,
    loading: messagesLoading,
    refetch: refetchMessages,
  } = useAgentChatMessages(currentThreadId);

  const isLoading = messagesLoading || threadsLoading || isStreaming;

  if (
    agentChatMessages.length === 0 &&
    isDefined(messagesData?.messages?.length)
  ) {
    setAgentChatMessages(messagesData.messages);
  }

  const createOptimisticMessages = (content: string): AgentChatMessage[] => {
    const optimisticUserMessage: OptimisticMessage = {
      id: v4(),
      threadId: currentThreadId,
      role: AgentChatMessageRole.USER,
      content,
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    const optimisticAiMessage: OptimisticMessage = {
      id: v4(),
      threadId: currentThreadId,
      role: AgentChatMessageRole.ASSISTANT,
      content: '',
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    return [optimisticUserMessage, optimisticAiMessage];
  };

  const streamAgentResponse = async (content: string) => {
    if (!currentThreadId) {
      return '';
    }

    setIsStreaming(true);

    await apolloClient.query({
      query: STREAM_CHAT_QUERY,
      variables: {
        requestBody: {
          threadId: currentThreadId,
          userMessage: content,
        },
      },
      context: {
        onChunk: (chunk: string) => {
          setAgentStreamingMessage(chunk);
          scrollToBottom();
        },
      },
    });

    setIsStreaming(false);
  };

  const sendChatMessage = async (content: string) => {
    const optimisticMessages = createOptimisticMessages(content);

    setAgentChatMessages((prevMessages) => [
      ...prevMessages,
      ...optimisticMessages,
    ]);

    setTimeout(scrollToBottom, 100);

    await streamAgentResponse(content);

    const { data } = await refetchMessages();

    setAgentChatMessages(data?.messages);
    setAgentStreamingMessage('');
    scrollToBottom();
  };

  const handleSendMessage = async () => {
    if (!agentChatInput.trim() || isLoading) {
      return;
    }
    const content = agentChatInput.trim();
    setAgentChatInput('');
    await sendChatMessage(content);
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    focusId: `${agentId}-chat-input`,
    scope: InputHotkeyScope.TextInput,
    dependencies: [agentChatInput, isLoading],
    options: {
      enableOnFormTags: true,
    },
  });

  return {
    handleInputChange: (value: string) => setAgentChatInput(value),
    messages: agentChatMessages,
    input: agentChatInput,
    handleSendMessage,
    isLoading,
    agentStreamingMessage,
  };
};
