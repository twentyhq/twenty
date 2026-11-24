import { useInboxChatAttention } from '@/inbox/hooks/useInboxChatAttention';
import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useNavigationMenuChatAttention = () => {
  const { chatAttention } = useInboxChatAttention();
  const { unreadOpenThreadCount } = useInboxOpenThreadsSummary();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  const tabIdsWithInboxSection = new Set(
    workspaceNavigationMenuItems.flatMap((item) =>
      item.builtInSectionKey === 'aiChatInbox' ? [item.parentId ?? null] : [],
    ),
  );

  return {
    chatAttention,
    unreadOpenThreadCount,
    getTabChatAttention: (tabId: string | null) =>
      tabIdsWithInboxSection.has(tabId) ? chatAttention : null,
  };
};
