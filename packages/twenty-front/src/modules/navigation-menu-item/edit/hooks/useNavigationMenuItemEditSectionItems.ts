import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { useContext } from 'react';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemContainerContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemContainerContext';

import { flattenNavigationMenuItemsWithFolderChildren } from '@/navigation-menu-item/common/utils/flattenNavigationMenuItemsWithFolderChildren';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';

export const useNavigationMenuItemEditSectionItems = (
  section: NavigationMenuItemSection,
): NavigationMenuItem[] => {
  const { containerId } = useContext(NavigationMenuItemContainerContext);
  const workspaceSectionItems = useNavigationMenuItemSectionItems(containerId);
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { userNavigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();

  if (section === 'workspace') {
    return workspaceSectionItems;
  }

  const topLevelItems = navigationMenuItemsSorted.filter(
    (item) => !item.folderId,
  );

  return flattenNavigationMenuItemsWithFolderChildren(
    topLevelItems,
    userNavigationMenuItemsByFolder,
  );
};
