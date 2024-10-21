import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreNumberOfSelectedRecordsState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsState';
import { contextStoreTargetedRecordsRuleState } from '@/context-store/states/contextStoreTargetedRecordsRuleState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { DELETE_MAX_COUNT } from '@/object-record/constants/DeleteMaxCount';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useFetchAllRecordIds } from '@/object-record/hooks/useFetchAllRecordIds';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IconTrash, isDefined } from 'twenty-ui';

export const DeleteRecordsActionEffect = ({
  position,
  objectMetadataItem,
}: {
  position: number;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
    useState(false);

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: objectMetadataItem.namePlural,
  });

  const { deleteManyRecords } = useDeleteManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { favorites, deleteFavorite } = useFavorites();

  const contextStoreNumberOfSelectedRecords = useRecoilValue(
    contextStoreNumberOfSelectedRecordsState,
  );

  const contextStoreTargetedRecordsRule = useRecoilValue(
    contextStoreTargetedRecordsRuleState,
  );

  const graphqlFilter = computeContextStoreFilters(
    contextStoreTargetedRecordsRule,
    objectMetadataItem,
  );

  const { fetchAllRecordIds } = useFetchAllRecordIds({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: graphqlFilter,
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

  const isRemoteObject = objectMetadataItem.isRemote;

  const canDelete =
    !isRemoteObject &&
    isDefined(contextStoreNumberOfSelectedRecords) &&
    contextStoreNumberOfSelectedRecords < DELETE_MAX_COUNT &&
    contextStoreNumberOfSelectedRecords > 0;

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
            title={`Delete ${contextStoreNumberOfSelectedRecords} ${
              contextStoreNumberOfSelectedRecords === 1 ? `record` : 'records'
            }`}
            subtitle={`Are you sure you want to delete ${
              contextStoreNumberOfSelectedRecords === 1
                ? 'this record'
                : 'these records'
            }? ${
              contextStoreNumberOfSelectedRecords === 1 ? 'It' : 'They'
            } can be recovered from the Options menu.`}
            onConfirmClick={() => handleDeleteClick()}
            deleteButtonText={`Delete ${
              contextStoreNumberOfSelectedRecords > 1 ? 'Records' : 'Record'
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
    contextStoreNumberOfSelectedRecords,
    handleDeleteClick,
    isDeleteRecordsModalOpen,
    position,
    removeActionMenuEntry,
  ]);

  return null;
};
