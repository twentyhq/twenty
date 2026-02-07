import { useAgentChatScrollToBottom } from '@/ai/hooks/useAgentChatScrollToBottom';
import {
  agentChatUsageState,
  type AgentChatUsageState,
} from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { isCreatingChatThreadState } from '@/ai/states/isCreatingChatThreadState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import {
  type SetterOrUpdater,
  useRecoilState,
  useSetRecoilState,
} from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  type AgentChatThread,
  useCreateChatThreadMutation,
  useGetChatMessagesQuery,
  useGetChatThreadsQuery,
} from '~/generated-metadata/graphql';

const setUsageFromThread = (
  thread: AgentChatThread,
  setAgentChatUsage: SetterOrUpdater<AgentChatUsageState | null>,
) => {
  const hasUsageData =
    (thread.conversationSize ?? 0) > 0 && isDefined(thread.contextWindowTokens);

  setAgentChatUsage(
    hasUsageData
      ? {
          lastMessage: null,
          conversationSize: thread.conversationSize ?? 0,
          contextWindowTokens: thread.contextWindowTokens ?? 0,
          inputTokens: thread.totalInputTokens,
          outputTokens: thread.totalOutputTokens,
          inputCredits: thread.totalInputCredits,
          outputCredits: thread.totalOutputCredits,
        }
      : null,
  );
};

export const useAgentChatData = () => {
  const [currentAIChatThread, setCurrentAIChatThread] = useRecoilState(
    currentAIChatThreadState,
  );
  const setAgentChatUsage = useSetRecoilState(agentChatUsageState);
  const [isCreatingChatThread, setIsCreatingChatThread] = useRecoilState(
    isCreatingChatThreadState,
  );

  const { scrollToBottom } = useAgentChatScrollToBottom();

  const [createChatThread] = useCreateChatThreadMutation({
    onCompleted: (data) => {
      setIsCreatingChatThread(false);
      setCurrentAIChatThread(data.createChatThread.id);
      setAgentChatUsage(null);
    },
    onError: () => {
      setIsCreatingChatThread(false);
    },
  });

  const { loading: threadsLoading } = useGetChatThreadsQuery({
    skip: isDefined(currentAIChatThread),
    onCompleted: (data) => {
      if (data.chatThreads.length > 0) {
        const firstThread = data.chatThreads[0];

        setCurrentAIChatThread(firstThread.id);
        setUsageFromThread(firstThread, setAgentChatUsage);
      } else if (!isCreatingChatThread) {
        setIsCreatingChatThread(true);
        createChatThread();
      }
    },
  });

  const { loading: messagesLoading, data } = useGetChatMessagesQuery({
    variables: { threadId: currentAIChatThread! },
    skip: !isDefined(currentAIChatThread),
    onCompleted: scrollToBottom,
  });

  const uiMessages = mapDBMessagesToUIMessages(data?.chatMessages || []);
  const isLoading = messagesLoading || threadsLoading;

  return {
    uiMessages,
    isLoading,
  };
};
