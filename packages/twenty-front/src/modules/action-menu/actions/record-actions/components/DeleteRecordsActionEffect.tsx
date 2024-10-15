import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordsFiltersState } from '@/context-store/states/contextStoreTargetedRecordsFilters';
import { contextStoreTargetedRecordsState } from '@/context-store/states/contextStoreTargetedRecordsState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { DELETE_MAX_COUNT } from '@/object-record/constants/DeleteMaxCount';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnFiltersIntoQueryFilter } from '@/object-record/record-filter/utils/turnFiltersIntoQueryFilter';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';
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

  const contextStoreTargetedRecords = useRecoilValue(
    contextStoreTargetedRecordsState,
  );

  const selectedRecordIds = contextStoreTargetedRecords.selectedRecordIds;
  const excludedRecordIds = contextStoreTargetedRecords.excludedRecordIds;

  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
  );

  const contextStoreTargetedRecordsFilters = useRecoilValue(
    contextStoreTargetedRecordsFiltersState,
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

  const shouldSkip = selectedRecordIds !== 'all';

  const queryFilter = turnFiltersIntoQueryFilter(
    contextStoreTargetedRecordsFilters,
    objectMetadataItem?.fields ?? [],
  );

  const { totalCount, records: recordsToDelete } = useFindManyRecords({
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
    recordGqlFields: {
      id: true,
    },
    filter: makeAndFilterVariables([
      queryFilter,
      excludedRecordIds.length > 0
        ? {
            not: {
              id: {
                in: excludedRecordIds,
              },
            },
          }
        : undefined,
    ]),
    skip: shouldSkip,
  });

  const numberOfSelectedRecords = totalCount ?? selectedRecordIds.length;

  const recordIdsToDelete = shouldSkip
    ? selectedRecordIds
    : recordsToDelete.map((record) => record.id);

  const handleDeleteClick = useCallback(
    async (recordIdsToDelete: string[]) => {
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
    },
    [deleteFavorite, deleteManyRecords, favorites, resetTableRowSelection],
  );

  const isRemoteObject = objectMetadataItem?.isRemote ?? false;

  const canDelete =
    !isRemoteObject &&
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
            onConfirmClick={() => handleDeleteClick(recordIdsToDelete)}
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
    canDelete,
    addActionMenuEntry,
    removeActionMenuEntry,
    isDeleteRecordsModalOpen,
    numberOfSelectedRecords,
    handleDeleteClick,
    position,
    recordIdsToDelete,
  ]);

  return null;
};
