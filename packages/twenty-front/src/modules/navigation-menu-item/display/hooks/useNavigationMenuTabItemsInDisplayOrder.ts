import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { useNavigationMenuItemsInContainers } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsInContainers';
import { useWorkspaceNavigationMenuSections } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuSections';
import { getNavigationMenuTabContainerIdsInDisplayOrder } from '@/navigation-menu-item/display/utils/getNavigationMenuTabContainerIdsInDisplayOrder';

export const useNavigationMenuTabItemsInDisplayOrder = (
  tabId: string | null,
): NavigationMenuItem[] => {
  const sections = useWorkspaceNavigationMenuSections(tabId);

  return useNavigationMenuItemsInContainers(
    getNavigationMenuTabContainerIdsInDisplayOrder({ sections, tabId }),
  );
};
