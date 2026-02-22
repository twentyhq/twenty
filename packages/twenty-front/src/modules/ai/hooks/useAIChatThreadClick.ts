import { agentChatUsageStateV2 } from '@/ai/states/agentChatUsageStateV2';
import { currentAIChatThreadStateV2 } from '@/ai/states/currentAIChatThreadStateV2';
import { currentAIChatThreadTitleStateV2 } from '@/ai/states/currentAIChatThreadTitleStateV2';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { isDefined } from 'twenty-shared/utils';
import { type AgentChatThread } from '~/generated-metadata/graphql';

export type UseAIChatThreadClickOptions = {
  resetNavigationStack?: boolean;
};

export const useAIChatThreadClick = (
  options: UseAIChatThreadClickOptions = {},
) => {
  const { resetNavigationStack = false } = options;
  const setCurrentAIChatThread = useSetRecoilStateV2(
    currentAIChatThreadStateV2,
  );
  const setCurrentAIChatThreadTitle = useSetRecoilStateV2(
    currentAIChatThreadTitleStateV2,
  );
  const setAgentChatUsage = useSetRecoilStateV2(agentChatUsageStateV2);
  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();

  const handleThreadClick = (thread: AgentChatThread) => {
    setCurrentAIChatThread(thread.id);
    setCurrentAIChatThreadTitle(thread.title ?? null);

    const hasUsageData =
      (thread.conversationSize ?? 0) > 0 &&
      isDefined(thread.contextWindowTokens);

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

    openAskAIPage({
      resetNavigationStack,
    });
  };

  return { handleThreadClick };
};
