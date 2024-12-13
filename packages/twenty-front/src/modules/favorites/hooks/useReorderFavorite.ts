import { useSortedFavorites } from '@/favorites/hooks/useSortedFavorites';
import { activeFavoriteFolderIdState } from '@/favorites/states/activeFavoriteFolderIdState';
import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useSetRecoilState } from 'recoil';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useReorderFavorite = () => {
  const { favorites } = usePrefetchedFavoritesData();
  const { favoritesSorted } = useSortedFavorites();
  const { updateOneRecord: updateOneFavorite } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Favorite,
  });
  const setActiveFavoriteFolderId = useSetRecoilState(
    activeFavoriteFolderIdState,
  );

  const handleReorderFavorite: OnDragEndResponder = (result) => {
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

    if (destination.droppableId.startsWith('folder-header-')) {
      const targetFolderId = destination.droppableId.replace(
        'folder-header-',
        '',
      );
      const folderFavorites = favoritesSorted.filter(
        (favorite) => favorite.favoriteFolderId === targetFolderId,
      );

      let newPosition;
      if (folderFavorites.length === 0) {
        newPosition = 0;
      } else {
        newPosition = folderFavorites[folderFavorites.length - 1].position + 1;
      }

      updateOneFavorite({
        idToUpdate: draggableId,
        updateOneRecordInput: {
          favoriteFolderId: targetFolderId,
          position: newPosition,
        },
      });

      setActiveFavoriteFolderId(targetFolderId);
      return;
    }

    if (destination.droppableId !== source.droppableId) {
      const newFolderId =
        destination.droppableId === 'orphan-favorites'
          ? null
          : destination.droppableId.replace('folder-', '');

      const destinationFavorites = favoritesSorted.filter(
        (favorite) => favorite.favoriteFolderId === newFolderId,
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
          favoriteFolderId: newFolderId,
          position: newPosition,
        },
      });
      return;
    }

    const currentFolderId =
      source.droppableId === 'orphan-favorites'
        ? null
        : source.droppableId.replace('folder-', '');

    const favoritesInSameList = favoritesSorted.filter(
      (favorite) => favorite.favoriteFolderId === currentFolderId,
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

  return { handleReorderFavorite };
};
