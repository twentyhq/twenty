import styled from '@emotion/styled';

import { NavigationDrawerAIChatThreadsList } from '@/ai/components/NavigationDrawerAIChatThreadsList';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useFavoritesByFolder } from '@/favorites/hooks/useFavoritesByFolder';
import { NavigationMenuItemFolderContentDispatcherEffect } from '@/navigation-menu-item/components/NavigationMenuItemFolderContentDispatcher';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/hooks/useNavigationMenuItemsByFolder';
import { MainNavigationDrawerScrollableItems } from '@/navigation/components/MainNavigationDrawerScrollableItems';
import { MainNavigationDrawerTabsRow } from '@/navigation/components/MainNavigationDrawerTabsRow';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { currentFavoriteFolderIdStateV2 } from '@/ui/navigation/navigation-drawer/states/currentFavoriteFolderIdStateV2';
import { currentNavigationMenuItemFolderIdStateV2 } from '@/ui/navigation/navigation-drawer/states/currentNavigationMenuItemFolderIdStateV2';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledScrollableContent = styled.div`
  height: 100%;
  min-height: 0;
`;

const StyledAIChatThreadsListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

export const MainNavigationDrawer = ({ className }: { className?: string }) => {
  const activeTab = useRecoilValueV2(navigationDrawerActiveTabState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const currentFavoriteFolderId = useRecoilValueV2(
    currentFavoriteFolderIdStateV2,
  );
  const currentNavigationMenuItemFolderId = useRecoilValueV2(
    currentNavigationMenuItemFolderIdStateV2,
  );
  const { favoritesByFolder } = useFavoritesByFolder();
  const { navigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  const openedFavoriteFolder = favoritesByFolder.find(
    (f) => f.folderId === currentFavoriteFolderId,
  );

  const openedNavigationMenuItemFolder = navigationMenuItemsByFolder.find(
    (f) => f.id === currentNavigationMenuItemFolderId,
  );

  const openedFolder = isNavigationMenuItemEditingEnabled
    ? openedNavigationMenuItemFolder
    : openedFavoriteFolder;

  const openedFolderId = openedNavigationMenuItemFolder?.id ?? '';

  return (
    <NavigationDrawer
      className={className}
      title={currentWorkspace?.displayName ?? ''}
    >
      <NavigationDrawerFixedContent>
        <MainNavigationDrawerTabsRow />
      </NavigationDrawerFixedContent>

      <NavigationDrawerScrollableContent>
        {activeTab === 'chat' ? (
          <StyledAIChatThreadsListWrapper>
            <NavigationDrawerAIChatThreadsList />
          </StyledAIChatThreadsListWrapper>
        ) : isNavigationMenuItemEditingEnabled ? (
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
