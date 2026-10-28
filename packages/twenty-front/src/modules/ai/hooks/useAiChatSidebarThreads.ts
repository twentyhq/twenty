import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatFavoriteChannelsSelector } from '@/ai/states/selectors/agentChatFavoriteChannelsSelector';
import { agentChatFavoriteThreadsSelector } from '@/ai/states/selectors/agentChatFavoriteThreadsSelector';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { excludeFavoriteAgentChatThreads } from '@/ai/utils/excludeFavoriteAgentChatThreads';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useAiChatSidebarThreads = () => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { handleThreadClick } = useAiChatThreadClick(
    isAiChatInboxEnabled
      ? { shouldOpenInFullPage: true }
      : { resetNavigationStack: true },
  );

  const { threads, loading } = useChatThreads(agentChatRecentThreadsSelector);
  const agentChatFavoriteThreads = useAtomStateValue(
    agentChatFavoriteThreadsSelector,
  );
  const agentChatFavoriteChannels = useAtomStateValue(
    agentChatFavoriteChannelsSelector,
  );

  const recentThreads = excludeFavoriteAgentChatThreads({
    threads,
    favoriteThreads: agentChatFavoriteThreads,
  });

  return {
    isAiChatInboxEnabled,
    isLoading: loading && threads.length === 0,
    favoriteChannels: isAiChatInboxEnabled ? agentChatFavoriteChannels : [],
    favoriteThreads: agentChatFavoriteThreads,
    recentThreads,
    currentAiChatThread,
    handleThreadClick,
  };
};
