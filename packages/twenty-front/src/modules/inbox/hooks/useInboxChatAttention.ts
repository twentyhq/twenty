import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { type InboxChatAttention } from '@/inbox/types/InboxChatAttention';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useInboxChatAttention = () => {
  const {
    needsInputThreadCount,
    hasUnreadMentionThread,
    hasUnreadAssignedThread,
  } = useInboxOpenThreadsSummary();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const getChatAttention = (): InboxChatAttention | null => {
    if (!isAiChatInboxEnabled) {
      return null;
    }

    if (needsInputThreadCount > 0) {
      return 'needs-input';
    }

    return hasUnreadMentionThread || hasUnreadAssignedThread ? 'unread' : null;
  };

  return { chatAttention: getChatAttention() };
};
