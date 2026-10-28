import { NavigationMenuItemType } from 'twenty-shared/types';

import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
import { useNavigationMenuAiChatSections } from '@/navigation-menu-item/display/hooks/useNavigationMenuAiChatSections';
import { type NavigationDrawerAttention } from '@/navigation/types/NavigationDrawerAttention';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useNavigationDrawerAttention = () => {
  const {
    needsInputThreadCount,
    hasUnreadMentionThread,
    hasUnreadAssignedThread,
  } = useAgentChatOpenThreadsSummary();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const aiChatSections = useNavigationMenuAiChatSections();

  const getInboxAttention = (): NavigationDrawerAttention | null => {
    if (!isAiChatInboxEnabled) {
      return null;
    }

    if (needsInputThreadCount > 0) {
      return 'needs-input';
    }

    return hasUnreadMentionThread || hasUnreadAssignedThread ? 'unread' : null;
  };

  const inboxAttention = getInboxAttention();
  const inboxSectionParentIds = new Set(
    aiChatSections
      .filter(
        (section) => section.type === NavigationMenuItemType.AI_CHAT_INBOX,
      )
      .map((section) => section.folderId ?? null),
  );
  const isInboxModeShown = aiChatSections.length === 0;

  return {
    inboxAttention,
    getTabAttention: (tabId: string | null) =>
      inboxSectionParentIds.has(tabId) ? inboxAttention : null,
    navigationDrawerAttention:
      isInboxModeShown || inboxSectionParentIds.size > 0
        ? inboxAttention
        : null,
  };
};
