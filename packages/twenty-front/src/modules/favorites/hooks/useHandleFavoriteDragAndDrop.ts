import { FAVORITE_DROPPABLE_IDS } from '@/favorites/constants/FavoriteDroppableIds';
import { useSortedFavorites } from '@/favorites/hooks/useSortedFavorites';
import { activeFavoriteFolderIdState } from '@/favorites/states/activeFavoriteFolderIdState';
import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { validateAndExtractFolderId } from '@/favorites/utils/validateAndExtractFolderId';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useSetRecoilState } from 'recoil';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useHandleFavoriteDragAndDrop = () => {
  const { favorites } = usePrefetchedFavoritesData();
  const { favoritesSorted } = useSortedFavorites();
  const { updateOneRecord: updateOneFavorite } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Favorite,
  });
  const setActiveFavoriteFolderId = useSetRecoilState(
    activeFavoriteFolderIdState,
  );

  const handleFavoriteDragAndDrop: OnDragEndResponder = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const draggedFavorite = favorites.find((f) => f.id === draggableId);
    if (!draggedFavorite) return;

    const destinationFolderId = validateAndExtractFolderId(
      destination.droppableId,
    );
    const sourceFolderId = validateAndExtractFolderId(source.droppableId);

    if (
      destination.droppableId.startsWith(
        FAVORITE_DROPPABLE_IDS.FOLDER_HEADER_PREFIX,
      )
    ) {
      if (destinationFolderId === null)
        throw new Error('Invalid folder header ID');

      const folderFavorites = favoritesSorted.filter(
        (favorite) => favorite.favoriteFolderId === destinationFolderId,
      );

      const newPosition =
        folderFavorites.length === 0
          ? 0
          : folderFavorites[folderFavorites.length - 1].position + 1;

      updateOneFavorite({
        idToUpdate: draggableId,
        updateOneRecordInput: {
          favoriteFolderId: destinationFolderId,
          position: newPosition,
        },
      });

      setActiveFavoriteFolderId(destinationFolderId);
      return;
    }

    if (destination.droppableId !== source.droppableId) {
      const destinationFavorites = favoritesSorted.filter(
        (favorite) => favorite.favoriteFolderId === destinationFolderId,
      );

      let newPosition;
      if (destinationFavorites.length === 0) {
        newPosition = 0;
      } else if (destination.index === 0) {
        newPosition = destinationFavorites[0].position / 2;
      } else if (destination.index >= destinationFavorites.length) {
        newPosition =
          destinationFavorites[destinationFavorites.length - 1].position + 1;
      } else {
        newPosition = calculateNewPosition({
          destinationIndex: destination.index,
          sourceIndex: -1,
          items: destinationFavorites,
        });
      }

      updateOneFavorite({
        idToUpdate: draggableId,
        updateOneRecordInput: {
          favoriteFolderId: destinationFolderId,
          position: newPosition,
        },
      });
      return;
    }

    const favoritesInSameList = favoritesSorted.filter(
      (favorite) => favorite.favoriteFolderId === sourceFolderId,
    );

    const newPosition = calculateNewPosition({
      destinationIndex: destination.index,
      sourceIndex: source.index,
      items: favoritesInSameList,
    });

    updateOneFavorite({
      idToUpdate: draggableId,
      updateOneRecordInput: { position: newPosition },
    });
  };

  return { handleFavoriteDragAndDrop };
};
