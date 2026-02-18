import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { FavoritesFolderContent } from '@/favorites/components/FavoritesFolderContent';
import { type ProcessedFavorite } from '@/favorites/utils/sortFavorites';
import { NavigationMenuItemFolderContent } from '@/navigation-menu-item/components/NavigationMenuItemFolderContent';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

type NavigationMenuItemFolderContentDispatcherEffectProps = {
  folderName: string;
  folderId: string;
  favorites?: ProcessedFavorite[];
  navigationMenuItems?: ProcessedNavigationMenuItem[];
};

export const NavigationMenuItemFolderContentDispatcherEffect = ({
  folderName,
  folderId,
  favorites,
  navigationMenuItems,
}: NavigationMenuItemFolderContentDispatcherEffectProps) => {
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  if (isNavigationMenuItemEditingEnabled && isDefined(navigationMenuItems)) {
    return (
      <NavigationMenuItemFolderContent
        folderId={folderId}
        folderName={folderName}
        navigationMenuItems={navigationMenuItems}
      />
    );
  }

  if (isDefined(favorites)) {
    return (
      <FavoritesFolderContent
        folderName={folderName}
        folderId={folderId}
        favorites={favorites}
      />
    );
  }

  return null;
};
