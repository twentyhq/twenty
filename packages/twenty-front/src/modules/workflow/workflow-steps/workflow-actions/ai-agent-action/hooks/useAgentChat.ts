import { useRecoilState } from 'recoil';

import {
  AgentChatMessage,
  useAgentChatMessagesQuery,
  useAgentChatThreadsQuery,
  useCreateAgentChatThreadMutation,
  useSendAgentChatMessageMutation,
} from '~/generated-metadata/graphql';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { agentChatMessagesState } from '../states/agentChatMessagesState';

export const useAgentChat = (agentId: string) => {
  const [agentChatMessages, setAgentChatMessages] = useRecoilState(
    agentChatMessagesState,
  );

  const {
    data: threadsData,
    loading: threadsLoading,
    refetch: refetchThreads,
  } = useAgentChatThreadsQuery({
    variables: {
      agentId,
    },
  });

  const currentThreadId = threadsData?.agentChatThreads[0]?.id;

  const { loading: messagesLoading } = useAgentChatMessagesQuery({
    variables: {
      threadId: currentThreadId || '',
    },
    skip: !currentThreadId,
    onCompleted: (data) => {
      if (isDefined(data?.agentChatMessages)) {
        setAgentChatMessages(data.agentChatMessages);
      }
    },
  });

  const [createThread, { loading: creatingThread }] =
    useCreateAgentChatThreadMutation({
      onCompleted: () => {
        refetchThreads();
      },
    });

  const [sendMessage, { loading: sendingMessage }] =
    useSendAgentChatMessageMutation({
      onCompleted: (data) => {
        if (isDefined(data?.sendAgentChatMessage)) {
          const newMessages = data.sendAgentChatMessage;
          setAgentChatMessages((prevMessages) => {
            const realMessages = prevMessages.filter(
              (msg) => !msg.id.startsWith('temp-'),
            );
            return [...realMessages, ...newMessages];
          });
        }
      },
      onError: () => {
        setAgentChatMessages((prevMessages) =>
          prevMessages.filter((msg) => !msg.id.startsWith('temp-')),
        );
      },
    });

  const sendChatMessage = async (message: string) => {
    let threadId = currentThreadId;

    if (!threadId) {
      await createThread({
        variables: {
          input: {
            agentId,
          },
        },
        onCompleted: (data) => {
          if (isDefined(data?.createAgentChatThread)) {
            threadId = data.createAgentChatThread.id;
          }
        },
      });
    }

    if (!threadId) {
      return;
    }

    const optimisticUserMessage: AgentChatMessage = {
      __typename: 'AgentChatMessage',
      id: `temp-${v4()}`,
      threadId,
      sender: 'user',
      message: message,
      createdAt: new Date().toISOString(),
    };

    const optimisticAiMessage: AgentChatMessage = {
      __typename: 'AgentChatMessage',
      id: `temp-${v4()}`,
      threadId,
      sender: 'ai',
      message: '',
      createdAt: new Date().toISOString(),
    };

    setAgentChatMessages((prevMessages) => [
      ...prevMessages,
      optimisticUserMessage,
      optimisticAiMessage,
    ]);

    await sendMessage({
      variables: {
        input: {
          threadId,
          message,
        },
      },
    });
  };

  return {
    messages: agentChatMessages,
    messagesLoading,
    sendingMessage,
    sendChatMessage,
  };
};
