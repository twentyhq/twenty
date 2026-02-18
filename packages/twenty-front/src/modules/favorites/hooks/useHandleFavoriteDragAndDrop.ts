import { FAVORITE_DROPPABLE_IDS } from '@/favorites/constants/FavoriteDroppableIds';
import { useSortedFavorites } from '@/favorites/hooks/useSortedFavorites';
import { openFavoriteFolderIdsStateV2 } from '@/favorites/states/openFavoriteFolderIdsStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { calculateNewPosition } from '@/ui/layout/draggable-list/utils/calculateNewPosition';
import { validateAndExtractFolderId } from '@/ui/layout/draggable-list/utils/validateAndExtractFolderId';
import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useHandleFavoriteDragAndDrop = () => {
  const { favorites } = usePrefetchedFavoritesData();
  const { favoritesSorted } = useSortedFavorites();
  const { updateOneRecord } = useUpdateOneRecord();
  const setOpenFavoriteFolderIds = useSetRecoilStateV2(
    openFavoriteFolderIdsStateV2,
  );

  const openDestinationFolder = (folderId: string | null) => {
    if (!folderId) return;

    setOpenFavoriteFolderIds((current) => {
      if (!current.includes(folderId)) {
        return [...current, folderId];
      }
      return current;
    });
  };

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

    const destinationFolderId = validateAndExtractFolderId({
      droppableId: destination.droppableId,
      orphanDroppableId: FAVORITE_DROPPABLE_IDS.ORPHAN_FAVORITES,
    });
    const sourceFolderId = validateAndExtractFolderId({
      droppableId: source.droppableId,
      orphanDroppableId: FAVORITE_DROPPABLE_IDS.ORPHAN_FAVORITES,
    });

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
          ? 1
          : folderFavorites[folderFavorites.length - 1].position + 1;

      updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.Favorite,
        idToUpdate: draggableId,
        updateOneRecordInput: {
          favoriteFolderId: destinationFolderId,
          position: newPosition,
        },
      });

      openDestinationFolder(destinationFolderId);
      return;
    }

    if (destination.droppableId !== source.droppableId) {
      const destinationFavorites = favoritesSorted.filter(
        (favorite) => favorite.favoriteFolderId === destinationFolderId,
      );

      let newPosition;
      if (destinationFavorites.length === 0) {
        newPosition = 1;
      } else if (destination.index === 0) {
        newPosition = destinationFavorites[0].position - 1;
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

      updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.Favorite,
        idToUpdate: draggableId,
        updateOneRecordInput: {
          favoriteFolderId: destinationFolderId,
          position: newPosition,
        },
      });
      return;
    }

    const favoritesInSameList = favoritesSorted
      .filter((favorite) => favorite.favoriteFolderId === sourceFolderId)
      .filter((favorite) => favorite.id !== draggableId);

    const newPosition = calculateNewPosition({
      destinationIndex: destination.index,
      sourceIndex: source.index,
      items: favoritesInSameList,
    });

    updateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Favorite,
      idToUpdate: draggableId,
      updateOneRecordInput: { position: newPosition },
    });
  };

  return { handleFavoriteDragAndDrop };
};
