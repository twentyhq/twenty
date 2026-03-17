import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { FavoritesSection } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSection';
import { FavoritesDndKitProvider } from '@/navigation/components/FavoritesDndKitProvider';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

export const FavoritesSectionDispatcher = () => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  return (
    <AnimatedEaseInOut isOpen={!isLayoutCustomizationModeEnabled} initial>
      <FavoritesDndKitProvider>
        <FavoritesSection />
      </FavoritesDndKitProvider>
    </AnimatedEaseInOut>
  );
};
