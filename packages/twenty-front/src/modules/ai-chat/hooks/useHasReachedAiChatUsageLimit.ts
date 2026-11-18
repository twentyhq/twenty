import { useAiChatUsage } from '@/ai-chat/hooks/useAiChatUsage';
import { useIsWorkspaceSetupChat } from '@/ai-chat/hooks/useIsWorkspaceSetupChat';
import { isAiChatUsageLimitReached } from '@/ai-chat/utils/isAiChatUsageLimitReached';

export const useHasReachedAiChatUsageLimit = () => {
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();

  const { usage } = useAiChatUsage({
    skip: isWorkspaceSetupChat,
    fetchPolicy: 'cache-and-network',
  });

  return isAiChatUsageLimitReached(usage);
};
