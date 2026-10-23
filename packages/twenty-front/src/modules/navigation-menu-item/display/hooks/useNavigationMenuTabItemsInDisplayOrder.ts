import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemSectionAboveContainerItems } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSectionAboveContainerItems';
import { useNavigationMenuItemsInContainers } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsInContainers';
import { useWorkspaceNavigationMenuSections } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuSections';

export const useNavigationMenuTabItemsInDisplayOrder = (
  tabId: string | null,
): NavigationMenuItem[] => {
  const sections = useWorkspaceNavigationMenuSections(tabId);
  const sectionIdsAboveItems = sections
    .filter(isNavigationMenuItemSectionAboveContainerItems)
    .map((section) => section.id);
  const sectionIdsBelowItems = sections
    .filter(
      (section) => !isNavigationMenuItemSectionAboveContainerItems(section),
    )
    .map((section) => section.id);

  return useNavigationMenuItemsInContainers([
    ...sectionIdsAboveItems,
    tabId,
    ...sectionIdsBelowItems,
  ]);
};
