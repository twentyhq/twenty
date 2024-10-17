import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { useContextStoreSelectedRecords } from '@/context-store/hooks/useContextStoreSelectedRecords';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { DELETE_MAX_COUNT } from '@/object-record/constants/DeleteMaxCount';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IconTrash, isDefined } from 'twenty-ui';

export const DeleteRecordsActionEffect = ({
  position,
}: {
  position: number;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataId,
  });

  const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
    useState(false);

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: objectMetadataItem?.namePlural ?? '',
  });

  const { deleteManyRecords } = useDeleteManyRecords({
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
  });

  const { favorites, deleteFavorite } = useFavorites();

  const { totalCount: numberOfSelectedRecords, fetchAllRecordIds } =
    useContextStoreSelectedRecords({
      recordGqlFields: {
        id: true,
      },
    });

  const handleDeleteClick = useCallback(async () => {
    const recordIdsToDelete = await fetchAllRecordIds();

    resetTableRowSelection();

    for (const recordIdToDelete of recordIdsToDelete) {
      const foundFavorite = favorites?.find(
        (favorite) => favorite.recordId === recordIdToDelete,
      );

      if (foundFavorite !== undefined) {
        deleteFavorite(foundFavorite.id);
      }
    }

    await deleteManyRecords(recordIdsToDelete, {
      delayInMsBetweenRequests: 50,
    });
  }, [
    deleteFavorite,
    deleteManyRecords,
    favorites,
    fetchAllRecordIds,
    resetTableRowSelection,
  ]);

  const isRemoteObject = objectMetadataItem?.isRemote ?? false;

  const canDelete =
    !isRemoteObject &&
    isDefined(numberOfSelectedRecords) &&
    numberOfSelectedRecords < DELETE_MAX_COUNT &&
    numberOfSelectedRecords > 0;

  useEffect(() => {
    if (canDelete) {
      addActionMenuEntry({
        key: 'delete',
        label: 'Delete',
        position,
        Icon: IconTrash,
        accent: 'danger',
        onClick: () => {
          setIsDeleteRecordsModalOpen(true);
        },
        ConfirmationModal: (
          <ConfirmationModal
            isOpen={isDeleteRecordsModalOpen}
            setIsOpen={setIsDeleteRecordsModalOpen}
            title={`Delete ${numberOfSelectedRecords} ${
              numberOfSelectedRecords === 1 ? `record` : 'records'
            }`}
            subtitle={`Are you sure you want to delete ${
              numberOfSelectedRecords === 1 ? 'this record' : 'these records'
            }? ${
              numberOfSelectedRecords === 1 ? 'It' : 'They'
            } can be recovered from the Options menu.`}
            onConfirmClick={() => handleDeleteClick()}
            deleteButtonText={`Delete ${
              numberOfSelectedRecords > 1 ? 'Records' : 'Record'
            }`}
          />
        ),
      });
    } else {
      removeActionMenuEntry('delete');
    }

    return () => {
      removeActionMenuEntry('delete');
    };
  }, [
    addActionMenuEntry,
    canDelete,
    handleDeleteClick,
    isDeleteRecordsModalOpen,
    numberOfSelectedRecords,
    position,
    removeActionMenuEntry,
  ]);

  return null;
};
