import { useRecoilValue } from 'recoil';
import styled from '@emotion/styled';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useFavoritesByFolder } from '@/favorites/hooks/useFavoritesByFolder';
import { NavigationMenuItemFolderContentDispatcherEffect } from '@/navigation-menu-item/components/NavigationMenuItemFolderContentDispatcher';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/hooks/useNavigationMenuItemsByFolder';
import { MainNavigationDrawerFixedItems } from '@/navigation/components/MainNavigationDrawerFixedItems';
import { MainNavigationDrawerScrollableItems } from '@/navigation/components/MainNavigationDrawerScrollableItems';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { currentFavoriteFolderIdStateV2 } from '@/ui/navigation/navigation-drawer/states/currentFavoriteFolderIdStateV2';
import { currentNavigationMenuItemFolderIdStateV2 } from '@/ui/navigation/navigation-drawer/states/currentNavigationMenuItemFolderIdStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledScrollableContent = styled.div`
  height: 100%;
  min-height: 0;
`;

export const MainNavigationDrawer = ({ className }: { className?: string }) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentFavoriteFolderId = useRecoilValueV2(
    currentFavoriteFolderIdStateV2,
  );
  const currentNavigationMenuItemFolderId = useRecoilValueV2(
    currentNavigationMenuItemFolderIdStateV2,
  );
  const { favoritesByFolder } = useFavoritesByFolder();
  const { navigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();
  const isNavigationMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_ENABLED,
  );

  const openedFavoriteFolder = favoritesByFolder.find(
    (f) => f.folderId === currentFavoriteFolderId,
  );

  const openedNavigationMenuItemFolder = navigationMenuItemsByFolder.find(
    (f) => f.id === currentNavigationMenuItemFolderId,
  );

  const openedFolder = isNavigationMenuItemEnabled
    ? openedNavigationMenuItemFolder
    : openedFavoriteFolder;

  const openedFolderId = openedNavigationMenuItemFolder?.id ?? '';

  return (
    <NavigationDrawer
      className={className}
      title={currentWorkspace?.displayName ?? ''}
    >
      <NavigationDrawerFixedContent>
        <MainNavigationDrawerFixedItems />
      </NavigationDrawerFixedContent>

      <NavigationDrawerScrollableContent>
        {isNavigationMenuItemEnabled ? (
          <StyledScrollableContent>
            {openedFolder ? (
              <NavigationMenuItemFolderContentDispatcherEffect
                folderName={openedFolder.folderName}
                folderId={openedFolderId}
                favorites={openedFavoriteFolder?.favorites}
                navigationMenuItems={
                  openedNavigationMenuItemFolder?.navigationMenuItems
                }
              />
            ) : (
              <MainNavigationDrawerScrollableItems />
            )}
          </StyledScrollableContent>
        ) : openedFolder ? (
          <NavigationMenuItemFolderContentDispatcherEffect
            folderName={openedFolder.folderName}
            folderId={openedFolderId}
            favorites={openedFavoriteFolder?.favorites}
            navigationMenuItems={
              openedNavigationMenuItemFolder?.navigationMenuItems
            }
          />
        ) : (
          <MainNavigationDrawerScrollableItems />
        )}
      </NavigationDrawerScrollableContent>
    </NavigationDrawer>
  );
};
