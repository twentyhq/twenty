import { FavoriteIcon } from '@/favorites/components/FavoriteIcon';
import { FavoritesDroppable } from '@/favorites/components/FavoritesDroppable';
import { FavoritesDragContext } from '@/favorites/contexts/FavoritesDragContext';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { isLocationMatchingFavorite } from '@/favorites/utils/isLocationMatchingFavorite';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import styled from '@emotion/styled';
import { LightIconButton } from '@ui/input/button/components/LightIconButton';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { IconHeartOff } from 'twenty-ui';

const StyledEmptyContainer = styled.div`
  width: 100%;
`;

const StyledOrphanFavoritesContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.betweenSiblingsGap};
`;

export const CurrentWorkspaceMemberOrphanFavorites = () => {
  const { sortedFavorites: favorites } = useFavorites();
  const { deleteFavorite } = useDeleteFavorite();
  const currentPath = useLocation().pathname;
  const currentViewPath = useLocation().pathname + useLocation().search;
  const { isDragging } = useContext(FavoritesDragContext);

  const orphanFavorites = favorites.filter(
    (favorite) => !favorite.favoriteFolderId,
  );

  return (
    <FavoritesDroppable droppableId="orphan-favorites">
      {orphanFavorites.length > 0 ? (
        orphanFavorites.map((favorite, index) => (
          <DraggableItem
            key={favorite.id}
            draggableId={favorite.id}
            index={index}
            isInsideScrollableContainer={true}
            itemComponent={
              <StyledOrphanFavoritesContainer>
                <NavigationDrawerItem
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
                  objectName={favorite.objectNameSingular}
                  isDragging={isDragging}
                />
              </StyledOrphanFavoritesContainer>
            }
          />
        ))
      ) : (
        <StyledEmptyContainer style={{ height: isDragging ? '24px' : '1px' }} />
      )}
    </FavoritesDroppable>
  );
};
