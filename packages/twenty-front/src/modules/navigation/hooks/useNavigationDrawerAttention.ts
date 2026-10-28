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
  const triageSectionParentIds = new Set(
    aiChatSections
      .filter(
        (section) => section.type === NavigationMenuItemType.AI_CHAT_TRIAGE,
      )
      .map((section) => section.folderId ?? null),
  );
  const isInboxModeShown = aiChatSections.length === 0;

  return {
    inboxAttention,
    getTabAttention: (tabId: string | null) =>
      triageSectionParentIds.has(tabId) ? inboxAttention : null,
    navigationDrawerAttention:
      isInboxModeShown || triageSectionParentIds.size > 0
        ? inboxAttention
        : null,
  };
};
