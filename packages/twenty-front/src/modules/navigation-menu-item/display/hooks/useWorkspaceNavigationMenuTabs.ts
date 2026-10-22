import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemTab } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTab';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useWorkspaceNavigationMenuTabs = (): NavigationMenuItem[] => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  return workspaceNavigationMenuItems
    .filter(isNavigationMenuItemTab)
    .sort((a, b) => a.position - b.position);
};
