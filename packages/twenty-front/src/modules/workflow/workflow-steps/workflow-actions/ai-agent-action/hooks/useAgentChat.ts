import { InputHotkeyScope } from '@/ui/input/types/InputHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import {
  AgentChatMessage,
  useAgentChatMessagesQuery,
  useAgentChatThreadsQuery,
  useSendAgentChatMessageMutation,
} from '~/generated-metadata/graphql';

import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { AgentChatMessageRole } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/agent-chat-message-role';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { agentChatInputState } from '../states/agentChatInputState';
import { agentChatMessagesComponentState } from '../states/agentChatMessagesComponentState';

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

  const { loading: messagesLoading } = useAgentChatMessagesQuery({
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

  const [sendMessage, { loading: sendingMessage }] =
    useSendAgentChatMessageMutation({
      onCompleted: (data) => {
        if (isDefined(data?.sendAgentChatMessage)) {
          const newMessages = data.sendAgentChatMessage;
          setAgentChatMessages((prevMessages) => {
            const confirmedMessages = filterOutPendingMessages(prevMessages);
            return [...confirmedMessages, ...newMessages];
          });
        }
      },
      onError: () => {
        setAgentChatMessages((prevMessages) =>
          filterOutPendingMessages(prevMessages),
        );
      },
    });

  const sendChatMessage = async (content: string) => {
    const optimisticUserMessage: OptimisticMessage = {
      __typename: 'AgentChatMessage',
      id: v4(),
      threadId: currentThreadId,
      role: AgentChatMessageRole.USER,
      content,
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    const optimisticAiMessage: OptimisticMessage = {
      __typename: 'AgentChatMessage',
      id: v4(),
      threadId: currentThreadId,
      role: AgentChatMessageRole.ASSISTANT,
      content: '',
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    setAgentChatMessages((prevMessages) => [
      ...prevMessages,
      optimisticUserMessage,
      optimisticAiMessage,
    ]);

    setTimeout(scrollToBottom, 100);

    await sendMessage({
      variables: {
        threadId: currentThreadId,
        content,
      },
    });

    setTimeout(scrollToBottom, 100);
  };

  const handleSendMessage = async () => {
    if (!agentChatInput.trim() || sendingMessage) {
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
    [agentChatInput, sendingMessage],
  );

  return {
    handleInputChange: (value: string) => setAgentChatInput(value),
    messages: agentChatMessages,
    input: agentChatInput,
    handleSendMessage,
    messagesLoading,
    sendingMessage,
  };
};
