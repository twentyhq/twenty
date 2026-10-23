import { AI_CHAT_INBOX_RECENT_THREADS_MAX_COUNT } from '@/ai/constants/AiChatInboxRecentThreadsMaxCount';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatFavoriteThreadsSelector } from '@/ai/states/selectors/agentChatFavoriteThreadsSelector';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
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

  const favoriteThreadIds = new Set(
    agentChatFavoriteThreads.map(({ id }) => id),
  );
  const nonFavoriteThreads = threads.filter(
    ({ id }) => !favoriteThreadIds.has(id),
  );
  const recentThreads = isAiChatInboxEnabled
    ? nonFavoriteThreads.slice(0, AI_CHAT_INBOX_RECENT_THREADS_MAX_COUNT)
    : nonFavoriteThreads;

  return {
    isAiChatInboxEnabled,
    isLoading: loading && threads.length === 0,
    favoriteThreads: agentChatFavoriteThreads,
    recentThreads,
    currentAiChatThread,
    handleThreadClick,
  };
};
