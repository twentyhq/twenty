import { useSortedFavorites } from '@/favorites/hooks/useSortedFavorites';
import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useReorderFavorite = () => {
  const { favorites } = usePrefetchedFavoritesData();
  const { favoritesSorted } = useSortedFavorites();
  const { updateOneRecord: updateOneFavorite } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Favorite,
  });

  const handleReorderFavorite: OnDragEndResponder = (result) => {
    if (!result.destination) return;

    const draggedFavoriteId = result.draggableId;
    const draggedFavorite = favorites.find((f) => f.id === draggedFavoriteId);

    if (!draggedFavorite) return;

    const inSameFolderFavorites = favoritesSorted.filter(
      (fav) => fav.favoriteFolderId === draggedFavorite.favoriteFolderId,
    );
    if (!inSameFolderFavorites.length) return;

    const newPosition = calculateNewPosition({
      destinationIndex: result.destination.index,
      sourceIndex: result.source.index,
      items: inSameFolderFavorites,
    });

    updateOneFavorite({
      idToUpdate: draggedFavoriteId,
      updateOneRecordInput: { position: newPosition },
    });
  };

  return { handleReorderFavorite };
};
