import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationMenuItemDndKitProvider } from '@/navigation-menu-item/display/dnd/providers/NavigationMenuItemDndKitProvider';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { FavoritesSection } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AnimatedEaseInOut } from 'twenty-ui-deprecated/utilities';

export const FavoritesSectionDispatcher = () => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();

  const hasFavorites = navigationMenuItemsSorted.some((item) => !item.folderId);

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
