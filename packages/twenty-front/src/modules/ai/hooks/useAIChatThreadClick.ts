import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined } from 'twenty-shared/utils';
import { type AgentChatThread } from '~/generated-metadata/graphql';

export type UseAIChatThreadClickOptions = {
  resetNavigationStack?: boolean;
};

export const useAIChatThreadClick = (
  options: UseAIChatThreadClickOptions = {},
) => {
  const { resetNavigationStack = false } = options;
  const [, setCurrentAIChatThread] = useAtomState(currentAIChatThreadState);
  const setCurrentAIChatThreadTitle = useSetAtomState(
    currentAIChatThreadTitleState,
  );
  const setAgentChatUsage = useSetAtomState(agentChatUsageState);
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
