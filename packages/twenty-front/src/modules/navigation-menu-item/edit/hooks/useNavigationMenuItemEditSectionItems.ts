import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { navigationMenuItemEditSectionState } from '@/navigation-menu-item/common/states/navigationMenuItemEditSectionState';
import { flattenNavigationMenuItemsWithFolderChildren } from '@/navigation-menu-item/common/utils/flattenNavigationMenuItemsWithFolderChildren';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useNavigationMenuItemEditSectionItems =
  (): NavigationMenuItem[] => {
    const navigationMenuItemEditSection = useAtomStateValue(
      navigationMenuItemEditSectionState,
    );
    const workspaceSectionItems = useNavigationMenuItemSectionItems();
    const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
    const { userNavigationMenuItemsByFolder } =
      useNavigationMenuItemsByFolder();

    if (navigationMenuItemEditSection === 'workspace') {
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
