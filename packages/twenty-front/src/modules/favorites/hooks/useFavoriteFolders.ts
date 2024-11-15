import { usePrefetchedFavoritesFoldersData } from '@/favorites/hooks/usePrefetchedFavoritesFoldersData';
import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useFavoriteFolders = () => {
  const { favorites, upsertFavorites, currentWorkspaceMemberId } =
    usePrefetchedFavoritesData();
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { folders } = usePrefetchedFavoritesFoldersData();
  const { objectMetadataItem: favoriteObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Favorite,
    });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { updateOneRecord: updateFavoriteFolder } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { createOneRecord: createFavoriteFolder } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });
  const favoriteRelationFieldMetadataItems = useMemo(
    () =>
      favoriteObjectMetadataItem.fields.filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.type === FieldMetadataType.Relation &&
          fieldMetadataItem.name !== 'workspaceMember' &&
          fieldMetadataItem.name !== 'favoriteFolder',
      ),
    [favoriteObjectMetadataItem.fields],
  );

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
  const getObjectRecordIdentifierByNameSingular =
    useGetObjectRecordIdentifierByNameSingular();
  const favoritesByFolder = useMemo(() => {
    return folders.map((folder) => ({
      folderId: folder.id,
      folderName: folder.name,
      favorites: sortFavorites(
        favorites.filter((favorite) => favorite.favoriteFolderId === folder.id),
        favoriteRelationFieldMetadataItems,
        getObjectRecordIdentifierByNameSingular,
        true,
        views,
        objectMetadataItems,
      ),
    }));
  }, [
    folders,
    favorites,
    favoriteRelationFieldMetadataItems,
    getObjectRecordIdentifierByNameSingular,
    views,
    objectMetadataItems,
  ]);
  return {
    favoriteFolder: folders,
    favoritesByFolder,
    createFolder,
    renameFolder,
    deleteFolder,
    handleReorderFavoriteFolder,
  };
};
