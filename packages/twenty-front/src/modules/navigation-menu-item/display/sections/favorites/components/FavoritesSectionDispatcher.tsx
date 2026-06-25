import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationMenuItemDndKitProvider } from '@/navigation-menu-item/display/dnd/providers/NavigationMenuItemDndKitProvider';
import { FavoritesSection } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSection';
import { useReadableFavoriteNavigationMenuItems } from '@/navigation-menu-item/display/sections/favorites/hooks/useReadableFavoriteNavigationMenuItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AnimatedEaseInOut } from 'twenty-ui/layout';

export const FavoritesSectionDispatcher = () => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { topLevelItems } = useReadableFavoriteNavigationMenuItems();

  const hasFavorites = topLevelItems.length > 0;

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
