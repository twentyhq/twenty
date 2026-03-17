import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/common/states/isNavigationMenuInEditModeState';
import { NavigationMenuItemDndKitProvider } from '@/navigation-menu-item/display/dnd/providers/NavigationMenuItemDndKitProvider';
import { FavoritesSection } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

export const FavoritesSectionDispatcher = () => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );

  return (
    <AnimatedEaseInOut isOpen={!isNavigationMenuInEditMode} initial>
      <NavigationMenuItemDndKitProvider section={NavigationSections.FAVORITES}>
        <FavoritesSection />
      </NavigationMenuItemDndKitProvider>
    </AnimatedEaseInOut>
  );
};
