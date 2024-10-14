import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar, isDefined } from 'twenty-ui';

import { FavoritesSkeletonLoader } from '@/favorites/components/FavoritesSkeletonLoader';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFavorites } from '../hooks/useFavorites';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItemsCollapsedContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsedContainer';

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

export const CurrentWorkspaceMemberFavorites = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { favorites, handleReorderFavorite } = useFavorites();
  const loading = useIsPrefetchLoading();
  const { toggleNavigationSection, isNavigationSectionOpenState } =
    useNavigationSection('Favorites');
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);

  if (loading && isDefined(currentWorkspaceMember)) {
    return <FavoritesSkeletonLoader />;
  }

  const currentWorkspaceMemberFavorites = favorites.filter(
    (favorite) => favorite.workspaceMemberId === currentWorkspaceMember?.id,
  );

  if (
    !currentWorkspaceMemberFavorites ||
    currentWorkspaceMemberFavorites.length === 0
  )
    return <></>;

  const isGroup = currentWorkspaceMemberFavorites.length > 1;

  const draggableListContent = (
    <DraggableList
      onDragEnd={handleReorderFavorite}
      draggableItems={
        <>
          {currentWorkspaceMemberFavorites.map((favorite, index) => {
            const {
              id,
              labelIdentifier,
              avatarUrl,
              avatarType,
              link,
              recordId,
            } = favorite;

            return (
              <DraggableItem
                key={id}
                draggableId={id}
                index={index}
                itemComponent={
                  <StyledNavigationDrawerItem
                    key={id}
                    label={labelIdentifier}
                    Icon={() => (
                      <StyledAvatar
                        placeholderColorSeed={recordId}
                        avatarUrl={avatarUrl}
                        type={avatarType}
                        placeholder={labelIdentifier}
                        className="fav-avatar"
                      />
                    )}
                    to={link}
                  />
                }
              />
            );
          })}
        </>
      }
    />
  );

  return (
    <StyledContainer>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label="Favorites"
          onClick={() => toggleNavigationSection()}
        />
      </NavigationDrawerAnimatedCollapseWrapper>

      {isNavigationSectionOpen && (
        <NavigationDrawerItemsCollapsedContainer isGroup={isGroup}>
          {draggableListContent}
        </NavigationDrawerItemsCollapsedContainer>
      )}
    </StyledContainer>
  );
};
