import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CurrentWorkspaceMemberFavorites } from '@/favorites/components/CurrentWorkspaceMemberFavorites';
import { FavoritesSkeletonLoader } from '@/favorites/components/FavoritesSkeletonLoader';
import { useFavoriteFolders } from '@/favorites/hooks/useFavoriteFolders';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { isFavoriteFolderCreatingState } from '@/favorites/states/isFavoriteFolderCreatingState';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
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
import { Avatar, IconFolder, IconFolderPlus, isDefined } from 'twenty-ui';

const StyledContainer = styled(NavigationDrawerSection)`
  width: 100%;
`;

const StyledAvatar = styled(Avatar)`
  :hover {
    cursor: grab;
  }
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
  const { createFolder } = useFavoriteFolders();
  const [folderName, setFolderName] = useState('');
  const currentPath = useLocation().pathname;
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
    const trimmedValue = value.trim();
    if (!trimmedValue) return false;

    setIsFavoriteFolderCreating(false);
    setFolderName('');
    await createFolder(trimmedValue);
    return true;
  };

  const handleClickOutside = async (
    event: MouseEvent | TouchEvent,
    value: string,
  ) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setIsFavoriteFolderCreating(false);
      return;
    }

    setIsFavoriteFolderCreating(false);
    setFolderName('');
    await createFolder(trimmedValue);
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
    !currentWorkspaceMemberFavorites ||
    currentWorkspaceMemberFavorites.length === 0
  ) {
    return <></>;
  }

  const unorganisedFavorites = currentWorkspaceMemberFavorites.filter(
    (favorite) => !favorite.favoriteFolderId,
  );
  const isGroup = currentWorkspaceMemberFavorites.length > 1;

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
              hotkeyScope="favorites-folder-input"
            />
          )}
          {favoritesByFolder.map((folder) => (
            <CurrentWorkspaceMemberFavorites
              key={folder.folderId}
              folder={folder}
              isGroup={isGroup}
              handleReorderFavorite={handleReorderFavorite}
              isOpen={activeFolderId === folder.folderId}
              onToggle={(folderId) => {
                setActiveFolderId((currentId) =>
                  currentId === folderId ? null : folderId,
                );
              }}
            />
          ))}
          {unorganisedFavorites.length > 0 &&
            unorganisedFavorites.map((favorite) => (
              <StyledNavigationDrawerItem
                key={favorite.id}
                label={favorite.labelIdentifier}
                Icon={() => (
                  <StyledAvatar
                    placeholderColorSeed={favorite.recordId}
                    avatarUrl={favorite.avatarUrl}
                    type={favorite.avatarType}
                    placeholder={favorite.labelIdentifier}
                    className="unorganised-fav-avatar"
                  />
                )}
                active={favorite.link === currentPath}
                to={favorite.link}
              />
            ))}
        </>
      )}
    </StyledContainer>
  );
};
