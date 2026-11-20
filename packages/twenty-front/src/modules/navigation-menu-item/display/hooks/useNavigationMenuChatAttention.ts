import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { getNavigationMenuChatAttention } from '@/navigation-menu-item/display/utils/getNavigationMenuChatAttention';
import { getNavigationMenuTabIdsWithChatSections } from '@/navigation-menu-item/display/utils/getNavigationMenuTabIdsWithChatSections';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useNavigationMenuChatAttention = () => {
  const inboxOpenThreadsSummary = useInboxOpenThreadsSummary();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const chatAttention = isAiChatInboxEnabled
    ? getNavigationMenuChatAttention(inboxOpenThreadsSummary)
    : null;
  const tabIdsWithChatSections = getNavigationMenuTabIdsWithChatSections(
    workspaceNavigationMenuItems,
  );

  return {
    chatAttention,
    unreadOpenThreadCount: inboxOpenThreadsSummary.unreadOpenThreadCount,
    getTabChatAttention: (tabId: string) =>
      tabIdsWithChatSections.has(tabId) ? chatAttention : null,
  };
};
