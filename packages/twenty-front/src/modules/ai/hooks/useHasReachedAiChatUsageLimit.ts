import { useAiChatUsage } from '@/ai/hooks/useAiChatUsage';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { isAiChatUsageLimitReached } from '@/ai/utils/isAiChatUsageLimitReached';

export const useHasReachedAiChatUsageLimit = () => {
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();

  const { usage } = useAiChatUsage({
    skip: isWorkspaceSetupChat,
    fetchPolicy: 'cache-and-network',
  });

  return isAiChatUsageLimitReached(usage);
};
