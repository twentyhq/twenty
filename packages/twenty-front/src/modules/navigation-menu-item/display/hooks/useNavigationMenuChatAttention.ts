import { type BuiltInSectionKey } from 'twenty-shared/types';
import { isBuiltInSectionKey, isDefined } from 'twenty-shared/utils';

import { useInboxChatAttention } from '@/inbox/hooks/useInboxChatAttention';
import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

const AI_CHAT_BUILT_IN_SECTION_KEYS: BuiltInSectionKey[] =
  NAVIGATION_MENU_BUILT_IN_SECTIONS.filter(({ isAi }) => isAi).map(
    ({ key }) => key,
  );

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
