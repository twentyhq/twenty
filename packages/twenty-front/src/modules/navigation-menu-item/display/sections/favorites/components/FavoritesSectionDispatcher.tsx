import { FavoritesSection } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSection';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/common/states/isNavigationMenuInEditModeState';
import { FavoritesDndKitProvider } from '@/navigation/components/FavoritesDndKitProvider';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

export const FavoritesSectionDispatcher = () => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );

  return (
    <AnimatedEaseInOut isOpen={!isNavigationMenuInEditMode} initial>
      <FavoritesDndKitProvider>
        <FavoritesSection />
      </FavoritesDndKitProvider>
    </AnimatedEaseInOut>
  );
};
