import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { CurrentWorkspaceMemberFavoritesFolders } from '@/favorites/components/CurrentWorkspaceMemberFavoritesFolders';
import { CurrentWorkspaceMemberNavigationMenuItemFolders } from '@/navigation-menu-item/components/CurrentWorkspaceMemberNavigationMenuItemFolders';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { FavoritesDragDropProviderContent } from '@/navigation/components/FavoritesDragDropProviderContent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

export const CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher = () => {
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );

  return (
    <AnimatedEaseInOut isOpen={!isNavigationMenuInEditMode} initial>
      {isNavigationMenuItemEditingEnabled ? (
        <FavoritesDragDropProviderContent>
          <CurrentWorkspaceMemberNavigationMenuItemFolders />
        </FavoritesDragDropProviderContent>
      ) : (
        <FavoritesDragDropProviderContent>
          <CurrentWorkspaceMemberFavoritesFolders />
        </FavoritesDragDropProviderContent>
      )}
    </AnimatedEaseInOut>
  );
};
