import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { navigationMenuItemEditSectionState } from '@/navigation-menu-item/common/states/navigationMenuItemEditSectionState';
import { flattenNavigationMenuItemsWithFolderChildren } from '@/navigation-menu-item/common/utils/flattenNavigationMenuItemsWithFolderChildren';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Flat ordered item list (orphans + folders followed by their children) for the
// section the add/edit panel is operating on. The edit page resolves the
// selected item and computes move/organize bounds against this list, so it must
// return personal items in the favorite section and workspace items otherwise.
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
