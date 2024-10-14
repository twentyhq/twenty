import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { DELETE_MAX_COUNT } from '@/object-record/constants/DeleteMaxCount';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IconTrash } from 'twenty-ui';

export const DeleteRecordsActionEffect = ({
  position,
}: {
  position: number;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );
  const selectedRecordIds = contextStoreTargetedRecordIds.selectedRecordIds;
  const excludedRecordIds = contextStoreTargetedRecordIds.excludedRecordIds;

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

  const { totalCount, records: recordsToDelete } = useFindManyRecords({
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
    recordGqlFields: ['id'],
    filter:
      selectedRecordIds === 'all'
        ? {
            not: {
              id: {
                in: excludedRecordIds,
              },
            },
          }
        : { id: { in: selectedRecordIds } },
  });

  const numberOfSelectedRecords = totalCount ?? 0;

  const recordIdsToDelete = recordsToDelete.map((record) => record.id);

  const handleDeleteClick = useCallback(async () => {
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
    recordIdsToDelete,
    resetTableRowSelection,
  ]);

  const isRemoteObject = objectMetadataItem?.isRemote ?? false;

  const canDelete =
    !isRemoteObject && numberOfSelectedRecords < DELETE_MAX_COUNT;

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
  }, [
    canDelete,
    addActionMenuEntry,
    removeActionMenuEntry,
    isDeleteRecordsModalOpen,
    numberOfSelectedRecords,
    handleDeleteClick,
    position,
  ]);

  return null;
};
