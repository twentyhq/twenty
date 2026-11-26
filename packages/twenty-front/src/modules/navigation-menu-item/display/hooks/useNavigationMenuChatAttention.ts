import { type BuiltInSectionKey } from 'twenty-shared/types';
import { isBuiltInSectionKey } from 'twenty-shared/utils';

import { useInboxChatAttention } from '@/inbox/hooks/useInboxChatAttention';
import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { AI_CHAT_BUILT_IN_SECTION_KEYS } from '@/navigation-menu-item/common/constants/AiChatBuiltInSectionKeys';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useNavigationMenuChatAttention = () => {
  const { chatAttention } = useInboxChatAttention();
  const { unreadOpenThreadCount } = useInboxOpenThreadsSummary();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  const hasInboxSection = workspaceNavigationMenuItems.some(
    ({ builtInSectionKey }) => builtInSectionKey === 'aiChatInbox',
  );
  const attentionSectionKeys: BuiltInSectionKey[] = hasInboxSection
    ? ['aiChatInbox']
    : AI_CHAT_BUILT_IN_SECTION_KEYS;
  const tabIdsWithAttentionSection = new Set(
    workspaceNavigationMenuItems.flatMap((item) =>
      isBuiltInSectionKey(item.builtInSectionKey) &&
      attentionSectionKeys.includes(item.builtInSectionKey)
        ? [item.parentId ?? null]
        : [],
    ),
  );

  return {
    chatAttention,
    unreadOpenThreadCount,
    getTabChatAttention: (tabId: string | null) =>
      isCustomizableSidebarEnabled && tabIdsWithAttentionSection.has(tabId)
        ? chatAttention
        : null,
  };
};
