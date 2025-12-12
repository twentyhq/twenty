import { useAgentChatScrollToBottom } from '@/ai/hooks/useAgentChatScrollToBottom';
import {
  agentChatUsageState,
  type AgentChatUsageState,
} from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import {
  type SetterOrUpdater,
  useRecoilState,
  useSetRecoilState,
} from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  type AgentChatThread,
  useGetChatMessagesQuery,
  useGetChatThreadsQuery,
} from '~/generated-metadata/graphql';

const setUsageFromThread = (
  thread: AgentChatThread,
  setAgentChatUsage: SetterOrUpdater<AgentChatUsageState | null>,
) => {
  const totalTokens = thread.totalInputTokens + thread.totalOutputTokens;
  const hasUsageData = totalTokens > 0 && isDefined(thread.contextWindowTokens);

  setAgentChatUsage(
    hasUsageData
      ? {
          inputTokens: thread.totalInputTokens,
          outputTokens: thread.totalOutputTokens,
          totalTokens,
          contextWindowTokens: thread.contextWindowTokens ?? 0,
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

  const { scrollToBottom } = useAgentChatScrollToBottom();

  const { loading: threadsLoading } = useGetChatThreadsQuery({
    skip: isDefined(currentAIChatThread),
    onCompleted: (data) => {
      if (data.chatThreads.length > 0) {
        const firstThread = data.chatThreads[0];

        setCurrentAIChatThread(firstThread.id);
        setUsageFromThread(firstThread, setAgentChatUsage);
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
