import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useFavoriteFolders = () => {
  const { folders, favorites, upsertFavorites, currentWorkspaceMemberId } =
    usePrefetchedFavoritesData();

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { updateOneRecord: updateFavoriteFolder } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { createOneRecord: createFavoriteFolder } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const createFolder = async (name: string): Promise<void> => {
    if (!name || !currentWorkspaceMemberId) {
      return;
    }

    const maxPosition = Math.max(
      ...folders.map((folder) => folder.position),
      0,
    );

    await createFavoriteFolder({
      workspaceMemberId: currentWorkspaceMemberId,
      name,
      position: maxPosition + 1,
    });
  };

  const handleReorderFavoriteFolder: OnDragEndResponder = (result) => {
    if (!result.destination) return;

    const draggedFolderId = result.draggableId;
    const draggedFolder = folders.find((f) => f.id === draggedFolderId);

    if (!draggedFolder) return;

    const newPosition = calculateNewPosition({
      destinationIndex: result.destination.index,
      sourceIndex: result.source.index,
      items: folders,
    });

    updateFavoriteFolder({
      idToUpdate: draggedFolderId,
      updateOneRecordInput: { position: newPosition },
    });
  };

  const renameFolder = async (
    folderId: string,
    newName: string,
  ): Promise<void> => {
    if (!newName || !currentWorkspaceMemberId) {
      return;
    }

    await updateFavoriteFolder({
      idToUpdate: folderId,
      updateOneRecordInput: {
        name: newName,
      },
    });
  };

  const deleteFolder = async (folderId: string): Promise<void> => {
    if (!currentWorkspaceMemberId) {
      return;
    }
    await deleteOneRecord(folderId);
    const updatedFavorites = favorites.filter(
      (favorite) => favorite.favoriteFolderId !== folderId,
    );
    upsertFavorites(updatedFavorites);
  };

  return {
    favoriteFolder: folders,
    createFolder,
    renameFolder,
    deleteFolder,
    handleReorderFavoriteFolder,
  };
};
