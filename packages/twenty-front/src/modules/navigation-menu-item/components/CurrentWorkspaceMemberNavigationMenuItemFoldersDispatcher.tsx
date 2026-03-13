import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { CurrentWorkspaceMemberFavoritesFolders } from '@/favorites/components/CurrentWorkspaceMemberFavoritesFolders';
import { CurrentWorkspaceMemberNavigationMenuItemFolders } from '@/navigation-menu-item/components/CurrentWorkspaceMemberNavigationMenuItemFolders';
import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { FavoritesDragDropProviderContent } from '@/navigation/components/FavoritesDragDropProviderContent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

export const CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher = () => {
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );
  const isLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );

  return (
    <AnimatedEaseInOut isOpen={!isLayoutCustomizationActive} initial>
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
