import { InputHotkeyScope } from '@/ui/input/types/InputHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { AgentChatMessageRole } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/agent-chat-message-role';
import { v4 } from 'uuid';
import { AgentChatMessage, agentChatApi } from '../api/agent-chat.api';
import { agentChatInputState } from '../states/agentChatInputState';
import { agentChatMessagesComponentState } from '../states/agentChatMessagesComponentState';
import { aiStreamingMessageState } from '../states/agentChatStreamingState';
import { useAgentChatMessages } from './useAgentChatMessages';
import { useAgentChatThreads } from './useAgentChatThreads';

interface OptimisticMessage extends AgentChatMessage {
  isPending: boolean;
}

export const useAgentChat = (agentId: string) => {
  const [agentChatMessages, setAgentChatMessages] = useRecoilComponentStateV2(
    agentChatMessagesComponentState,
    agentId,
  );

  const [agentChatInput, setAgentChatInput] =
    useRecoilState(agentChatInputState);

  const [aiStreamingMessage, setAiStreamingMessage] = useRecoilState(
    aiStreamingMessageState,
  );

  const [isStreaming, setIsStreaming] = useState(false);

  const { scrollWrapperHTMLElement } = useScrollWrapperElement(agentId);

  const { data: threads = [], isLoading: threadsLoading } =
    useAgentChatThreads(agentId);
  const currentThreadId = threads[0]?.id;

  const {
    data: messages = [],
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useAgentChatMessages(currentThreadId);

  const isLoading = messagesLoading || threadsLoading || isStreaming;

  const scrollToBottom = useCallback(() => {
    scrollWrapperHTMLElement?.scroll({
      top: scrollWrapperHTMLElement.scrollHeight,
      behavior: 'smooth',
    });
  }, [scrollWrapperHTMLElement]);

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

    await agentChatApi.streamResponse(currentThreadId, content, (chunk) => {
      setAiStreamingMessage(chunk);
      scrollToBottom();
    });
    refetchMessages();

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

    refetchMessages();
  };

  const handleSendMessage = async () => {
    if (!agentChatInput.trim() || isLoading) {
      return;
    }
    const content = agentChatInput.trim();
    setAgentChatInput('');
    await sendChatMessage(content);
  };

  useScopedHotkeys(
    [Key.Enter],
    (event) => {
      if (!event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    InputHotkeyScope.TextInput,
    [agentChatInput, isLoading],
  );

  useEffect(() => {
    if (messages.length > 0) {
      setAgentChatMessages(messages);
      scrollToBottom();
    }
    setAiStreamingMessage('');
  }, [messages, setAgentChatMessages, scrollToBottom, setAiStreamingMessage]);

  return {
    handleInputChange: (value: string) => setAgentChatInput(value),
    messages: agentChatMessages,
    input: agentChatInput,
    handleSendMessage,
    isLoading,
    aiStreamingMessage,
  };
};
