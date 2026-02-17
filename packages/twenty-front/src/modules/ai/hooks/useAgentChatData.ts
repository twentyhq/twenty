import { useAgentChatScrollToBottom } from '@/ai/hooks/useAgentChatScrollToBottom';
import {
  agentChatUsageStateV2,
  type AgentChatUsageState,
} from '@/ai/states/agentChatUsageStateV2';
import { currentAIChatThreadStateV2 } from '@/ai/states/currentAIChatThreadStateV2';
import { currentAIChatThreadTitleStateV2 } from '@/ai/states/currentAIChatThreadTitleStateV2';
import { isCreatingChatThreadStateV2 } from '@/ai/states/isCreatingChatThreadStateV2';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { type SetterOrUpdater } from 'recoil';
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
  const [currentAIChatThread, setCurrentAIChatThread] = useRecoilStateV2(
    currentAIChatThreadStateV2,
  );
  const setAgentChatUsage = useSetRecoilStateV2(agentChatUsageStateV2);
  const setCurrentAIChatThreadTitle = useSetRecoilStateV2(
    currentAIChatThreadTitleStateV2,
  );
  const [isCreatingChatThread, setIsCreatingChatThread] = useRecoilStateV2(
    isCreatingChatThreadStateV2,
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
  });

  const { loading: threadsLoading } = useGetChatThreadsQuery({
    skip: isDefined(currentAIChatThread),
    onCompleted: (data) => {
      if (data.chatThreads.length > 0) {
        const firstThread = data.chatThreads[0];

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
