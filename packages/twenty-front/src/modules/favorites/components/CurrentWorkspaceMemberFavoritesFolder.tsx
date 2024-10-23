import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CurrentWorkspaceMemberFavorites } from '@/favorites/components/CurrentWorkspaceMemberFavorites';
import { FavoritesSkeletonLoader } from '@/favorites/components/FavoritesSkeletonLoader';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Avatar, IconFolderPlus, isDefined } from 'twenty-ui';

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
  const currentPath = useLocation().pathname;
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { favorites, handleReorderFavorite, favoritesByFolder } =
    useFavorites();
  const loading = useIsPrefetchLoading();
  const { toggleNavigationSection, isNavigationSectionOpenState } =
    useNavigationSection('Favorites');
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);
  const toggleNewFolder = () => setIsCreatingNewFolder((current) => !current);

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
          rightIcon={<IconFolderPlus size={14} />}
          onRightIconClick={toggleNewFolder}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      {isNavigationSectionOpen && (
        <>
          {isCreatingNewFolder && <></>}
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
