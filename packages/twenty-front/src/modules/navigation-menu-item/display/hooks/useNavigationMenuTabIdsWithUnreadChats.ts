import { type BuiltInSectionKey } from 'twenty-shared/types';
import { isBuiltInSectionKey, isDefined } from 'twenty-shared/utils';

import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const AI_CHAT_BUILT_IN_SECTION_KEYS: BuiltInSectionKey[] =
  NAVIGATION_MENU_BUILT_IN_SECTIONS.filter(({ isAi }) => isAi).map(
    ({ key }) => key,
  );

export const useNavigationMenuTabIdsWithUnreadChats = () => {
  const { unreadOpenThreadCount } = useInboxOpenThreadsSummary();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const tabIdsWithUnreadChats = new Set<string>();

  if (!isAiChatInboxEnabled || unreadOpenThreadCount === 0) {
    return { tabIdsWithUnreadChats, unreadOpenThreadCount };
  }

  for (const item of workspaceNavigationMenuItems) {
    if (
      isDefined(item.parentId) &&
      isBuiltInSectionKey(item.builtInSectionKey) &&
      AI_CHAT_BUILT_IN_SECTION_KEYS.includes(item.builtInSectionKey)
    ) {
      tabIdsWithUnreadChats.add(item.parentId);
    }
  }

  return { tabIdsWithUnreadChats, unreadOpenThreadCount };
};
