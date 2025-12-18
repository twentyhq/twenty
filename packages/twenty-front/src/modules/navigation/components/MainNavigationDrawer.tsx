import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { FavoritesFolderContent } from '@/favorites/components/FavoritesFolderContent';
import { useFavoritesByFolder } from '@/favorites/hooks/useFavoritesByFolder';
import { MainNavigationDrawerFixedItems } from '@/navigation/components/MainNavigationDrawerFixedItems';
import { MainNavigationDrawerScrollableItems } from '@/navigation/components/MainNavigationDrawerScrollableItems';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { currentFavoriteFolderIdState } from '@/ui/navigation/navigation-drawer/states/currentFavoriteFolderIdState';

export const MainNavigationDrawer = ({ className }: { className?: string }) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentFavoriteFolderId = useRecoilValue(currentFavoriteFolderIdState);
  const { favoritesByFolder } = useFavoritesByFolder();
  const openedFolder = favoritesByFolder.find(
    (f) => f.folderId === currentFavoriteFolderId,
  );

  return (
    <NavigationDrawer
      className={className}
      title={currentWorkspace?.displayName ?? ''}
    >
      <NavigationDrawerFixedContent>
        <MainNavigationDrawerFixedItems />
      </NavigationDrawerFixedContent>

      <NavigationDrawerScrollableContent>
        {currentFavoriteFolderId && openedFolder ? (
          <FavoritesFolderContent
            folderName={openedFolder.folderName}
            folderId={openedFolder.folderId}
            favorites={openedFolder.favorites}
          />
        ) : (
          <MainNavigationDrawerScrollableItems />
        )}
      </NavigationDrawerScrollableContent>
    </NavigationDrawer>
  );
};
