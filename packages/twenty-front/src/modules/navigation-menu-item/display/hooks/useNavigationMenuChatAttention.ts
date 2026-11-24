import { isBuiltInSectionKey, isDefined } from 'twenty-shared/utils';

import { useInboxChatAttention } from '@/inbox/hooks/useInboxChatAttention';
import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { AI_CHAT_BUILT_IN_SECTION_KEYS } from '@/navigation-menu-item/common/constants/AiChatBuiltInSectionKeys';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useNavigationMenuChatAttention = () => {
  const { chatAttention } = useInboxChatAttention();
  const { unreadOpenThreadCount } = useInboxOpenThreadsSummary();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  const tabIdsWithChatSections = new Set(
    workspaceNavigationMenuItems.flatMap((item) =>
      isDefined(item.parentId) &&
      isBuiltInSectionKey(item.builtInSectionKey) &&
      AI_CHAT_BUILT_IN_SECTION_KEYS.includes(item.builtInSectionKey)
        ? [item.parentId]
        : [],
    ),
  );

  return {
    chatAttention,
    unreadOpenThreadCount,
    getTabChatAttention: (tabId: string) =>
      tabIdsWithChatSections.has(tabId) ? chatAttention : null,
  };
};
