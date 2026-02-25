import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { CurrentWorkspaceMemberFavoritesFolders } from '@/favorites/components/CurrentWorkspaceMemberFavoritesFolders';
import { CurrentWorkspaceMemberNavigationMenuItemFolders } from '@/navigation-menu-item/components/CurrentWorkspaceMemberNavigationMenuItemFolders';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher = () => {
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  if (isNavigationMenuItemEditingEnabled) {
    return <CurrentWorkspaceMemberNavigationMenuItemFolders />;
  }

  return <CurrentWorkspaceMemberFavoritesFolders />;
};
