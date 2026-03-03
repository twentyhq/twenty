import { useAgentChatScrollToBottom } from '@/ai/hooks/useAgentChatScrollToBottom';
import {
  agentChatUsageState,
  type AgentChatUsageState,
} from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { isCreatingChatThreadState } from '@/ai/states/isCreatingChatThreadState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type SetStateAction } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import {
  type AgentChatThread,
  GetChatThreadsDocument,
  useCreateChatThreadMutation,
  useGetChatMessagesQuery,
  useGetChatThreadsQuery,
} from '~/generated-metadata/graphql';

const setUsageFromThread = (
  thread: AgentChatThread,
  setAgentChatUsage: (
    update: SetStateAction<AgentChatUsageState | null>,
  ) => void,
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
  const [currentAIChatThread, setCurrentAIChatThread] = useAtomState(
    currentAIChatThreadState,
  );
  const setAgentChatUsage = useSetAtomState(agentChatUsageState);
  const setCurrentAIChatThreadTitle = useSetAtomState(
    currentAIChatThreadTitleState,
  );
  const [isCreatingChatThread, setIsCreatingChatThread] = useAtomState(
    isCreatingChatThreadState,
  );

  const { scrollToBottom } = useAgentChatScrollToBottom();

  const [createChatThread] = useCreateChatThreadMutation({
    onCompleted: (data) => {
      setIsCreatingChatThread(false);
      setCurrentAIChatThread(data.createChatThread.id);
      setCurrentAIChatThreadTitle(null);
      setAgentChatUsage(null);
    },
    onError: () => {
      setIsCreatingChatThread(false);
    },
    refetchQueries: [
      {
        query: GetChatThreadsDocument,
        variables: { input: { first: 20 } },
      },
    ],
  });

  const { loading: threadsLoading } = useGetChatThreadsQuery({
    variables: { input: { first: 20 } },
    skip: isDefined(currentAIChatThread),
    onCompleted: (data) => {
      const threads = data?.chatThreads?.threads ?? [];
      if (threads.length > 0) {
        const firstThread = threads[0];

        setCurrentAIChatThread(firstThread.id);
        setCurrentAIChatThreadTitle(firstThread.title ?? null);
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
