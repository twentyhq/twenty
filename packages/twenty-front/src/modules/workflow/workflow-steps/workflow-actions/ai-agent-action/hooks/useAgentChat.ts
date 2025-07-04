import { InputHotkeyScope } from '@/ui/input/types/InputHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { AgentChatMessageRole } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/agent-chat-message-role';
import { v4 } from 'uuid';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { agentChatInputState } from '../states/agentChatInputState';
import { agentChatMessagesComponentState } from '../states/agentChatMessagesComponentState';
import { aiStreamingMessageState } from '../states/agentChatStreamingState';

interface AgentChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface AgentChatThread {
  id: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

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

  const [threads, setThreads] = useState<AgentChatThread[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [threadsLoading, setThreadsLoading] = useState(false);

  const { scrollWrapperHTMLElement } = useScrollWrapperElement(agentId);

  const currentThreadId = threads[0]?.id;

  const scrollToBottom = () => {
    scrollWrapperHTMLElement?.scroll({
      top: scrollWrapperHTMLElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  const isPendingMessage = (
    message: AgentChatMessage | OptimisticMessage,
  ): boolean => {
    return 'isPending' in message && message.isPending;
  };

  const filterOutPendingMessages = (
    messages: (AgentChatMessage | OptimisticMessage)[],
  ): AgentChatMessage[] => {
    return messages.filter(
      (msg) => !isPendingMessage(msg),
    ) as AgentChatMessage[];
  };

  const fetchThreads = async () => {
    setThreadsLoading(true);
    try {
      const response = await fetch(
        `${REACT_APP_SERVER_BASE_URL}/rest/agent-chat/threads/${agentId}`,
        {
          headers: {
            Authorization: `Bearer ${getTokenPair()?.accessToken.token}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setThreadsLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    setMessagesLoading(true);
    try {
      const response = await fetch(
        `${REACT_APP_SERVER_BASE_URL}/rest/agent-chat/messages/${threadId}`,
        {
          headers: {
            Authorization: `Bearer ${getTokenPair()?.accessToken.token}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setAgentChatMessages(data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const createThread = async () => {
    try {
      const response = await fetch(
        `${REACT_APP_SERVER_BASE_URL}/rest/agent-chat/threads`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getTokenPair()?.accessToken.token}`,
          },
          body: JSON.stringify({ agentId }),
        },
      );
      if (response.ok) {
        const newThread = await response.json();
        setThreads([newThread, ...threads]);
        return newThread.id;
      }
    } catch (error) {
      console.error('Error creating thread:', error);
    }
    return null;
  };

  useEffect(() => {
    fetchThreads();
  }, [agentId]);

  useEffect(() => {
    if (currentThreadId) {
      fetchMessages(currentThreadId);
    }
  }, [currentThreadId]);

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
    setAiStreamingMessage('');
    let message = '';

    const response = await fetch(
      `${REACT_APP_SERVER_BASE_URL}/rest/agent-chat/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getTokenPair()?.accessToken.token}`,
        },
        body: JSON.stringify({
          threadId: currentThreadId,
          userMessage: content,
        }),
      },
    );

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulated += chunk;
      message = accumulated;
      setAiStreamingMessage(accumulated);
    }

    return message;
  };

  const sendChatMessage = async (content: string) => {
    // Create thread if none exists
    let threadId = currentThreadId;
    if (!threadId) {
      threadId = await createThread();
      if (!threadId) return;
    }

    const optimisticMessages = createOptimisticMessages(content);

    setAgentChatMessages((prevMessages) => [
      ...prevMessages,
      ...optimisticMessages,
    ]);

    setTimeout(scrollToBottom, 100);

    await streamAgentResponse(content);

    // Refresh messages after streaming
    if (threadId) {
      fetchMessages(threadId);
    }
  };

  const handleSendMessage = async () => {
    if (!agentChatInput.trim() || messagesLoading) {
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
    [agentChatInput, messagesLoading],
  );

  return {
    handleInputChange: (value: string) => setAgentChatInput(value),
    messages: agentChatMessages,
    input: agentChatInput,
    handleSendMessage,
    messagesLoading: messagesLoading || threadsLoading,
    aiStreamingMessage,
  };
};
