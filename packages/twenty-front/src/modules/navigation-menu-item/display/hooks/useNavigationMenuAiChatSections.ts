import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemAiChatSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAiChatSection';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useNavigationMenuAiChatSections = (): NavigationMenuItem[] => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  return workspaceNavigationMenuItems.filter(isNavigationMenuItemAiChatSection);
};
