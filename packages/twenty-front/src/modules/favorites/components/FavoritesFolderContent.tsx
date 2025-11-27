import { FavoriteIcon } from '@/favorites/components/FavoriteIcon';
import { FavoritesBackButton } from '@/favorites/components/FavoritesBackButton';
import { FavoritesDragProvider } from '@/favorites/components/FavoritesDragProvider';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { getFavoriteSecondaryLabel } from '@/favorites/utils/getFavoriteSecondaryLabel';
import { type ProcessedFavorite } from '@/favorites/utils/sortFavorites';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { Droppable } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';
import { IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

type FavoritesFolderContentProps = {
  folderId: string;
  folderName: string;
  favorites: ProcessedFavorite[];
};

export const FavoritesFolderContent = ({
  folderName,
  folderId,
  favorites,
}: FavoritesFolderContentProps) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { deleteFavorite } = useDeleteFavorite();

  return (
    <>
      <FavoritesBackButton folderName={folderName} />
      <FavoritesDragProvider>
        <Droppable droppableId={`folder-${folderId}`}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...provided.droppableProps}
            >
              {favorites.map((favorite, index) => (
                <DraggableItem
                  key={favorite.id}
                  draggableId={favorite.id}
                  index={index}
                  isInsideScrollableContainer
                  itemComponent={
                    <NavigationDrawerItem
                      secondaryLabel={getFavoriteSecondaryLabel({
                        objectMetadataItems,
                        favoriteObjectNameSingular: favorite.objectNameSingular,
                      })}
                      label={favorite.labelIdentifier}
                      Icon={() => <FavoriteIcon favorite={favorite} />}
                      rightOptions={
                        <LightIconButton
                          Icon={IconHeartOff}
                          onClick={() => deleteFavorite(favorite.id)}
                          accent="tertiary"
                        />
                      }
                      triggerEvent="CLICK"
                      to={favorite.link}
                    />
                  }
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </FavoritesDragProvider>
    </>
  );
};
