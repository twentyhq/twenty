import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconFolderPlus, IconHeartOff, isDefined } from 'twenty-ui';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FavoriteIcon } from '@/favorites/components/FavoriteIcon';
import { FavoriteFolders } from '@/favorites/components/FavoritesFolders';
import { FavoritesSkeletonLoader } from '@/favorites/components/FavoritesSkeletonLoader';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { isFavoriteFolderCreatingState } from '@/favorites/states/isFavoriteFolderCreatingState';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

const StyledContainer = styled(NavigationDrawerSection)`
  width: 100%;
`;

const StyledNavigationDrawerItem = styled(NavigationDrawerItem)`
  :active {
    cursor: grabbing;

    .fav-avatar:hover {
      cursor: grabbing;
    }
  }
`;

export const CurrentWorkspaceMemberFavoritesFolders = () => {
  const currentPath = useLocation().pathname;
  const currentViewPath = useLocation().pathname + useLocation().search;
  const theme = useTheme();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { favorites, handleReorderFavorite, deleteFavorite } = useFavorites();
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

  const unorganisedFavorites = currentWorkspaceMemberFavorites.filter(
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
    <StyledContainer>
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

          {unorganisedFavorites.length > 0 && (
            <DraggableList
              onDragEnd={handleReorderFavorite}
              draggableItems={unorganisedFavorites.map((favorite, index) => (
                <DraggableItem
                  key={favorite.id}
                  draggableId={favorite.id}
                  index={index}
                  itemComponent={
                    <StyledNavigationDrawerItem
                      key={favorite.id}
                      className="navigation-drawer-item"
                      label={favorite.labelIdentifier}
                      Icon={() => <FavoriteIcon favorite={favorite} />}
                      active={
                        favorite.objectNameSingular === 'view'
                          ? favorite.link === currentViewPath
                          : favorite.link === currentPath
                      }
                      to={favorite.link}
                      rightOptions={
                        <IconHeartOff
                          size={theme.icon.size.sm}
                          color={theme.color.gray50}
                          onClick={() => deleteFavorite(favorite.id)}
                        />
                      }
                    />
                  }
                />
              ))}
            />
          )}
        </>
      )}
    </StyledContainer>
  );
};
