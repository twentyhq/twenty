import { useMemo } from 'react';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Favorite } from '@/favorites/types/Favorite';
import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const useFavorites = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const favoriteObjectNameSingular = 'favorite';

  const { objectMetadataItem: favoriteObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: favoriteObjectNameSingular,
    });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: favoriteObjectNameSingular,
  });

  const { updateOneRecord: updateOneFavorite } = useUpdateOneRecord({
    objectNameSingular: favoriteObjectNameSingular,
  });

  const { createOneRecord: createOneFavorite } = useCreateOneRecord({
    objectNameSingular: favoriteObjectNameSingular,
  });

  const { records: favorites } = useFindManyRecords<Favorite>({
    objectNameSingular: favoriteObjectNameSingular,
  });

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
    return favorites
      .map((favorite) => {
        for (const relationField of favoriteRelationFieldMetadataItems) {
          if (isDefined(favorite[relationField.name])) {
            const relationObject = favorite[relationField.name];

            const relationObjectNameSingular =
              relationField.toRelationMetadata?.fromObjectMetadata
                .nameSingular ?? '';

            const objectRecordIdentifier =
              getObjectRecordIdentifierByNameSingular(
                relationObject,
                relationObjectNameSingular,
              );

            return {
              id: favorite.id,
              recordId: objectRecordIdentifier.id,
              position: favorite.position,
              avatarType: objectRecordIdentifier.avatarType,
              avatarUrl: objectRecordIdentifier.avatarUrl,
              labelIdentifier: objectRecordIdentifier.name,
              link: objectRecordIdentifier.linkToShowPage,
            } as Favorite;
          }
        }

        return favorite;
      })
      .sort((a, b) => a.position - b.position);
  }, [
    favoriteRelationFieldMetadataItems,
    favorites,
    getObjectRecordIdentifierByNameSingular,
  ]);

  const createFavorite = (
    targetRecord: Record<string, any>,
    targetObjectNameSingular: string,
  ) => {
    createOneFavorite({
      [`${targetObjectNameSingular}`]: targetRecord,
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
    createFavorite,
    handleReorderFavorite,
    deleteFavorite,
  };
};
