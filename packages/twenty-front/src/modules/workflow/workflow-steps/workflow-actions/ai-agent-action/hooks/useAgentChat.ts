import { InputHotkeyScope } from '@/ui/input/types/InputHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import {
  AgentChatMessage,
  useAgentChatMessagesQuery,
  useAgentChatThreadsQuery,
} from '~/generated-metadata/graphql';

import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { AgentChatMessageRole } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/agent-chat-message-role';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { agentChatInputState } from '../states/agentChatInputState';
import { agentChatMessagesComponentState } from '../states/agentChatMessagesComponentState';
import { aiStreamingMessageState } from '../states/agentChatStreamingState';

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

  const { data: threadsData } = useAgentChatThreadsQuery({
    variables: {
      agentId,
    },
  });

  const { scrollWrapperHTMLElement } = useScrollWrapperElement(agentId);

  const currentThreadId = threadsData?.agentChatThreads[0]?.id as string;

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

  const { loading: messagesLoading, refetch: refetchMessages } =
    useAgentChatMessagesQuery({
      variables: {
        threadId: currentThreadId as string,
      },
      skip: !currentThreadId,
      onCompleted: (data) => {
        if (isDefined(data?.agentChatMessages)) {
          setAgentChatMessages(data.agentChatMessages);
        }
        scrollToBottom();
      },
    });

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
    messagesLoading,
    aiStreamingMessage,
  };
};
