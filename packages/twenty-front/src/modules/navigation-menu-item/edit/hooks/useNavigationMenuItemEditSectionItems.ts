import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { flattenNavigationMenuItemsWithFolderChildren } from '@/navigation-menu-item/common/utils/flattenNavigationMenuItemsWithFolderChildren';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';

export const useNavigationMenuItemEditSectionItems = (
  section: NavigationMenuItemSection,
  containerId: string | null = null,
): NavigationMenuItem[] => {
  const workspaceSectionItems = useNavigationMenuItemSectionItems({
    containerId,
  });
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { userNavigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();

  if (section === 'workspace') {
    return workspaceSectionItems;
  }

  const topLevelItems = navigationMenuItemsSorted.filter(
    (item) => !item.parentId,
  );

  return flattenNavigationMenuItemsWithFolderChildren(
    topLevelItems,
    userNavigationMenuItemsByFolder,
  );
};
