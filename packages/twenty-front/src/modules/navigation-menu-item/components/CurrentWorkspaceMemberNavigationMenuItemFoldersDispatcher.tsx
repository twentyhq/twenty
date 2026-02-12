import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { CurrentWorkspaceMemberFavoritesFolders } from '@/favorites/components/CurrentWorkspaceMemberFavoritesFolders';
import { CurrentWorkspaceMemberNavigationMenuItemFolders } from '@/navigation-menu-item/components/CurrentWorkspaceMemberNavigationMenuItemFolders';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher = () => {
  const isNavigationMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_ENABLED,
  );

  if (isNavigationMenuItemEnabled) {
    return <CurrentWorkspaceMemberNavigationMenuItemFolders />;
  }

  return <CurrentWorkspaceMemberFavoritesFolders />;
};
