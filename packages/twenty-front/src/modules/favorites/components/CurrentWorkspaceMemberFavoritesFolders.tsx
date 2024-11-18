import { useTheme } from '@emotion/react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  IconFolderPlus,
  IconHeartOff,
  isDefined,
  LightIconButton,
} from 'twenty-ui';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FavoriteIcon } from '@/favorites/components/FavoriteIcon';
import { FavoriteFolders } from '@/favorites/components/FavoritesFolders';
import { FavoritesSkeletonLoader } from '@/favorites/components/FavoritesSkeletonLoader';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useReorderFavorite } from '@/favorites/hooks/useReorderFavorite';
import { isFavoriteFolderCreatingState } from '@/favorites/states/isFavoriteFolderCreatingState';
import { isLocationMatchingFavorite } from '@/favorites/utils/isLocationMatchingFavorite';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const CurrentWorkspaceMemberFavoritesFolders = () => {
  const currentPath = useLocation().pathname;
  const currentViewPath = useLocation().pathname + useLocation().search;
  const theme = useTheme();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const favorites = useFavorites();
  const deleteFavorite = useDeleteFavorite();
  const handleReorderFavorite = useReorderFavorite();
  const [isFavoriteFolderCreating, setIsFavoriteFolderCreating] =
    useRecoilState(isFavoriteFolderCreatingState);

  const isFavoriteFolderEnabled = useIsFeatureEnabled(
    'IS_FAVORITE_FOLDER_ENABLED',
  );
  const loading = useIsPrefetchLoading();

  const { toggleNavigationSection, isNavigationSectionOpenState } =
    useNavigationSection('Favorites');
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);

  const toggleNewFolder = () => {
    setIsFavoriteFolderCreating((current) => !current);
  };

  if (loading && isDefined(currentWorkspaceMember)) {
    return <FavoritesSkeletonLoader />;
  }

  const currentWorkspaceMemberFavorites = favorites.filter(
    (favorite) => favorite.workspaceMemberId === currentWorkspaceMember?.id,
  );

  const orphanFavorites = currentWorkspaceMemberFavorites.filter(
    (favorite) => !favorite.favoriteFolderId,
  );

  if (
    (!currentWorkspaceMemberFavorites ||
      currentWorkspaceMemberFavorites.length === 0) &&
    !isFavoriteFolderCreating
  ) {
    return null;
  }

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label="Favorites"
          onClick={toggleNavigationSection}
          rightIcon={
            isFavoriteFolderEnabled ? (
              <IconFolderPlus size={theme.icon.size.sm} />
            ) : undefined
          }
          onRightIconClick={
            isFavoriteFolderEnabled ? toggleNewFolder : undefined
          }
        />
      </NavigationDrawerAnimatedCollapseWrapper>

      {isNavigationSectionOpen && (
        <>
          {isFavoriteFolderEnabled && (
            <FavoriteFolders
              isNavigationSectionOpen={isNavigationSectionOpen}
            />
          )}

          {orphanFavorites.length > 0 && (
            <DraggableList
              onDragEnd={handleReorderFavorite}
              draggableItems={orphanFavorites.map((favorite, index) => (
                <DraggableItem
                  key={favorite.id}
                  draggableId={favorite.id}
                  index={index}
                  itemComponent={
                    <NavigationDrawerItem
                      key={favorite.id}
                      className="navigation-drawer-item"
                      label={favorite.labelIdentifier}
                      Icon={() => <FavoriteIcon favorite={favorite} />}
                      active={isLocationMatchingFavorite(
                        currentPath,
                        currentViewPath,
                        favorite,
                      )}
                      to={favorite.link}
                      rightOptions={
                        <LightIconButton
                          Icon={IconHeartOff}
                          onClick={() => deleteFavorite(favorite.id)}
                          accent="tertiary"
                        />
                      }
                      isDraggable={true}
                    />
                  }
                />
              ))}
            />
          )}
        </>
      )}
    </NavigationDrawerSection>
  );
};
