import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { NavigationMenuItemDndKitProvider } from '@/navigation-menu-item/display/dnd/providers/NavigationMenuItemDndKitProvider';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { FavoritesSection } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AnimatedEaseInOut } from 'twenty-ui/layout';

export const FavoritesSectionDispatcher = () => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { userNavigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();

  const hasReadableOrphan = navigationMenuItemsSorted.some(
    (item) => !item.folderId && !isNavigationMenuItemFolder(item),
  );
  const hasNonEmptyFolder = userNavigationMenuItemsByFolder.some(
    (folder) => folder.navigationMenuItems.length > 0,
  );
  const hasFavorites = hasReadableOrphan || hasNonEmptyFolder;

  if (!hasFavorites) {
    return null;
  }

  return (
    <AnimatedEaseInOut isOpen={!isLayoutCustomizationModeEnabled} initial>
      <NavigationMenuItemDndKitProvider section={NavigationSections.FAVORITES}>
        <FavoritesSection />
      </NavigationMenuItemDndKitProvider>
    </AnimatedEaseInOut>
  );
};
