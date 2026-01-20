import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

export const useDeleteFavorite = () => {
  const isNavigationMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_ENABLED,
  );

  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Favorite,
  });

  const deleteFavorite = async (favoriteId: string) => {
    if (isNavigationMenuItemEnabled) {
      await deleteNavigationMenuItem(favoriteId);
    } else {
      deleteOneRecord(favoriteId);
    }
  };

  return { deleteFavorite };
};
