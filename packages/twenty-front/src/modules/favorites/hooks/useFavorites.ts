import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Favorite } from '@/favorites/types/Favorite';
import { sortFavorites } from '@/favorites/utils/sort-favorites.util';
import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useFavorites = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objectMetadataItem: favoriteObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Favorite,
    });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Favorite,
  });

  const { updateOneRecord: updateOneFavorite } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Favorite,
  });

  const { createOneRecord: createOneFavorite } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Favorite,
  });

  const { records: favorites } = usePrefetchedData<Favorite>(
    PrefetchKey.AllFavorites,
    {
      workspaceMemberId: {
        eq: currentWorkspaceMember?.id ?? '',
      },
    },
  );

  const { records: workspaceFavorites } = usePrefetchedData<Favorite>(
    PrefetchKey.AllFavorites,
    {
      workspaceMemberId: {
        eq: undefined,
      },
    },
  );

  const favoriteRelationFieldMetadataItems = useMemo(
    () =>
      favoriteObjectMetadataItem.fields.filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.type === FieldMetadataType.Relation &&
          fieldMetadataItem.name !== 'workspaceMember',
      ),
    [favoriteObjectMetadataItem.fields],
  );

  const getObjectRecordIdentifierByNameSingular =
    useGetObjectRecordIdentifierByNameSingular();

  const favoritesSorted = useMemo(() => {
    return sortFavorites(
      favorites,
      favoriteRelationFieldMetadataItems,
      getObjectRecordIdentifierByNameSingular,
      true,
    );
  }, [
    favoriteRelationFieldMetadataItems,
    favorites,
    getObjectRecordIdentifierByNameSingular,
  ]);

  const workspaceFavoritesSorted = useMemo(() => {
    return sortFavorites(
      workspaceFavorites.filter((favorite) => favorite.viewId),
      favoriteRelationFieldMetadataItems,
      getObjectRecordIdentifierByNameSingular,
      false,
    );
  }, [
    favoriteRelationFieldMetadataItems,
    getObjectRecordIdentifierByNameSingular,
    workspaceFavorites,
  ]);

  const createFavorite = (
    targetRecord: Record<string, any>,
    targetObjectNameSingular: string,
  ) => {
    createOneFavorite({
      [targetObjectNameSingular]: targetRecord,
      position: favorites.length + 1,
      workspaceMemberId: currentWorkspaceMember?.id,
    });
  };

  const deleteFavorite = (favoriteId: string) => {
    deleteOneRecord(favoriteId);
  };

  const computeNewPosition = (destIndex: number, sourceIndex: number) => {
    const moveToFirstPosition = destIndex === 0;
    const moveToLastPosition = destIndex === favoritesSorted.length - 1;
    const moveAfterSource = destIndex > sourceIndex;

    if (moveToFirstPosition) {
      return favoritesSorted[0].position / 2;
    } else if (moveToLastPosition) {
      return favoritesSorted[destIndex - 1].position + 1;
    } else if (moveAfterSource) {
      return (
        (favoritesSorted[destIndex + 1].position +
          favoritesSorted[destIndex].position) /
        2
      );
    } else {
      return (
        favoritesSorted[destIndex].position -
        (favoritesSorted[destIndex].position -
          favoritesSorted[destIndex - 1].position) /
          2
      );
    }
  };

  const handleReorderFavorite: OnDragEndResponder = (result) => {
    if (!result.destination || !favoritesSorted) {
      return;
    }

    const newPosition = computeNewPosition(
      result.destination.index,
      result.source.index,
    );

    const updatedFavorite = favoritesSorted[result.source.index];

    updateOneFavorite({
      idToUpdate: updatedFavorite.id,
      updateOneRecordInput: {
        position: newPosition,
      },
    });
  };

  return {
    favorites: favoritesSorted,
    workspaceFavorites: workspaceFavoritesSorted,
    createFavorite,
    handleReorderFavorite,
    deleteFavorite,
  };
};
