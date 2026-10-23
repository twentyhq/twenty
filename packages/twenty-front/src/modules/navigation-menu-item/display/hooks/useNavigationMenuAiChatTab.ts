import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemAiChatSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAiChatSection';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useWorkspaceNavigationMenuTabs } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuTabs';

export const useNavigationMenuAiChatTab = (): {
  aiChatTab: NavigationMenuItem | null;
  hasAiChatSections: boolean;
} => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const tabs = useWorkspaceNavigationMenuTabs();

  const aiChatSectionParentIds = new Set(
    workspaceNavigationMenuItems
      .filter(isNavigationMenuItemAiChatSection)
      .map((item) => item.folderId ?? null),
  );

  return {
    aiChatTab: tabs.find((tab) => aiChatSectionParentIds.has(tab.id)) ?? null,
    hasAiChatSections: aiChatSectionParentIds.size > 0,
  };
};
