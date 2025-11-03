import { FavoriteIcon } from '@/favorites/components/FavoriteIcon';
import { FavoritesDroppable } from '@/favorites/components/FavoritesDroppable';
import { FavoritesDragContext } from '@/favorites/contexts/FavoritesDragContext';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { getFavoriteSecondaryLabel } from '@/favorites/utils/getFavoriteSecondaryLabel';
import { isLocationMatchingFavorite } from '@/favorites/utils/isLocationMatchingFavorite';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

const StyledEmptyContainer = styled.div`
  width: 100%;
`;

const StyledOrphanFavoritesContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.betweenSiblingsGap};
`;

export const CurrentWorkspaceMemberOrphanFavorites = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
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
                  secondaryLabel={getFavoriteSecondaryLabel({
                    objectMetadataItems,
                    favoriteObjectNameSingular: favorite.objectNameSingular,
                  })}
                  label={favorite.labelIdentifier}
                  Icon={() => <FavoriteIcon favorite={favorite} />}
                  active={isLocationMatchingFavorite(
                    currentPath,
                    currentViewPath,
                    favorite,
                  )}
                  to={isDragging ? undefined : favorite.link}
                  rightOptions={
                    <LightIconButton
                      Icon={IconHeartOff}
                      onClick={() => deleteFavorite(favorite.id)}
                      accent="tertiary"
                    />
                  }
                  isDragging={isDragging}
                  triggerEvent="CLICK"
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
