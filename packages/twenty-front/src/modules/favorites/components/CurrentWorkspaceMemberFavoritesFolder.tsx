import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CurrentWorkspaceMemberFavorites } from '@/favorites/components/CurrentWorkspaceMemberFavorites';
import { FavoriteIcon } from '@/favorites/components/FavoriteIcon';
import { FavoritesSkeletonLoader } from '@/favorites/components/FavoritesSkeletonLoader';
import { FavoriteFolderHotkeyScope } from '@/favorites/constants/FavoriteFolderRightIconDropdownHotkeyScope';
import { useFavoriteFolders } from '@/favorites/hooks/useFavoriteFolders';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { isFavoriteFolderCreatingState } from '@/favorites/states/isFavoriteFolderCreatingState';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconFolder, IconFolderPlus, IconHeartOff, isDefined } from 'twenty-ui';

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
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const { createFolder, favoriteFolder } = useFavoriteFolders();
  const { deleteFavorite } = useFavorites();
  const [folderName, setFolderName] = useState('');
  const currentPath = useLocation().pathname;
  const currentPathView = useLocation().pathname + useLocation().search;
  const [isFavoriteFolderCreating, setIsFavoriteFolderCreating] =
    useRecoilState(isFavoriteFolderCreatingState);
  const theme = useTheme();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { favorites, handleReorderFavorite, favoritesByFolder } =
    useFavorites();
  const loading = useIsPrefetchLoading();
  const { toggleNavigationSection, isNavigationSectionOpenState } =
    useNavigationSection('Favorites');
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);

  const handleFolderNameChange = (value: string) => {
    setFolderName(value);
  };

  const handleSubmitFolder = async (value: string) => {
    if (!value) return false;

    setIsFavoriteFolderCreating(false);
    setFolderName('');
    await createFolder(value);
    return true;
  };

  const handleClickOutside = async (
    event: MouseEvent | TouchEvent,
    value: string,
  ) => {
    if (!value) {
      setIsFavoriteFolderCreating(false);
      return;
    }

    setIsFavoriteFolderCreating(false);
    setFolderName('');
    await createFolder(value);
  };

  const handleCancel = () => {
    setFolderName('');
    setIsFavoriteFolderCreating(false);
  };

  const toggleNewFolder = () => {
    setIsFavoriteFolderCreating((current) => !current);
    setFolderName('');
  };

  if (loading && isDefined(currentWorkspaceMember)) {
    return <FavoritesSkeletonLoader />;
  }

  const currentWorkspaceMemberFavorites = favorites.filter(
    (favorite) => favorite.workspaceMemberId === currentWorkspaceMember?.id,
  );

  if (
    (!currentWorkspaceMemberFavorites ||
      currentWorkspaceMemberFavorites.length === 0) &&
    (!favoriteFolder || favoriteFolder.length === 0) &&
    !isFavoriteFolderCreating
  ) {
    return <></>;
  }

  const unorganisedFavorites = currentWorkspaceMemberFavorites.filter(
    (favorite) => !favorite.favoriteFolderId,
  );
  const isGroup =
    currentWorkspaceMemberFavorites.length > 1 || favoritesByFolder.length > 1;

  return (
    <StyledContainer>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label="Favorites"
          onClick={() => toggleNavigationSection()}
          rightIcon={<IconFolderPlus size={theme.icon.size.sm} />}
          onRightIconClick={toggleNewFolder}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      {isNavigationSectionOpen && (
        <>
          {isFavoriteFolderCreating && (
            <NavigationDrawerInput
              Icon={IconFolder}
              value={folderName}
              onChange={handleFolderNameChange}
              onSubmit={handleSubmitFolder}
              onCancel={handleCancel}
              onClickOutside={handleClickOutside}
              hotkeyScope={
                FavoriteFolderHotkeyScope.FavoriteFolderNavigationInput
              }
            />
          )}
          {favoritesByFolder.map((folder) => (
            <CurrentWorkspaceMemberFavorites
              key={folder.folderId}
              folder={folder}
              isGroup={isGroup}
              isOpen={activeFolderId === folder.folderId}
              onToggle={(folderId) => {
                setActiveFolderId((currentId) =>
                  currentId === folderId ? null : folderId,
                );
              }}
            />
          ))}

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
                          ? favorite.link === currentPathView
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
