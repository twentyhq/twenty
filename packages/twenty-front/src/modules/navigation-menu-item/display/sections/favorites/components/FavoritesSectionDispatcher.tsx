import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationMenuItemDndKitProvider } from '@/navigation-menu-item/display/dnd/providers/NavigationMenuItemDndKitProvider';
import { FavoritesSection } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSection';

export const FavoritesSectionDispatcher = () => {
  return (
    <NavigationMenuItemDndKitProvider section={NavigationSections.FAVORITES}>
      <FavoritesSection />
    </NavigationMenuItemDndKitProvider>
  );
};
