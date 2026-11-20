import { type BuiltInSectionKey } from 'twenty-shared/types';
import { isBuiltInSectionKey, isDefined } from 'twenty-shared/utils';

import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { getNavigationMenuChatAttention } from '@/navigation-menu-item/display/utils/getNavigationMenuChatAttention';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const AI_CHAT_BUILT_IN_SECTION_KEYS: BuiltInSectionKey[] =
  NAVIGATION_MENU_BUILT_IN_SECTIONS.filter(({ isAi }) => isAi).map(
    ({ key }) => key,
  );

export const useNavigationMenuChatAttention = () => {
  const inboxOpenThreadsSummary = useInboxOpenThreadsSummary();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const chatAttention = isAiChatInboxEnabled
    ? getNavigationMenuChatAttention(inboxOpenThreadsSummary)
    : null;

  const tabIdsWithChatSections = new Set(
    workspaceNavigationMenuItems
      .filter(
        (item) =>
          isDefined(item.parentId) &&
          isBuiltInSectionKey(item.builtInSectionKey) &&
          AI_CHAT_BUILT_IN_SECTION_KEYS.includes(item.builtInSectionKey),
      )
      .map((item) => item.parentId),
  );

  return {
    chatAttention,
    unreadOpenThreadCount: inboxOpenThreadsSummary.unreadOpenThreadCount,
    getTabChatAttention: (tabId: string) =>
      tabIdsWithChatSections.has(tabId) ? chatAttention : null,
  };
};
