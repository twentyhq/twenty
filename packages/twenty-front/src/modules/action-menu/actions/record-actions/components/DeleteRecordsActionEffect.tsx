import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { ActionMenuType } from '@/action-menu/types/ActionMenuType';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { DELETE_MAX_COUNT } from '@/object-record/constants/DeleteMaxCount';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useFetchAllRecordIds } from '@/object-record/hooks/useFetchAllRecordIds';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useCallback, useEffect, useState } from 'react';
import { IconTrash, isDefined } from 'twenty-ui';

export const DeleteRecordsActionEffect = ({
  position,
  objectMetadataItem,
  actionMenuType,
}: {
  position: number;
  objectMetadataItem: ObjectMetadataItem;
  actionMenuType: ActionMenuType;
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

  const contextStoreNumberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const graphqlFilter = computeContextStoreFilters(
    contextStoreTargetedRecordsRule,
    objectMetadataItem,
  );

  const { fetchAllRecordIds } = useFetchAllRecordIds({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: graphqlFilter,
  });

  const { closeRightDrawer } = useRightDrawer();

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
            onConfirmClick={() => {
              handleDeleteClick();

              if (actionMenuType === 'recordShow') {
                closeRightDrawer();
              }
            }}
            deleteButtonText={`Delete ${
              contextStoreNumberOfSelectedRecords > 1 ? 'Records' : 'Record'
            }`}
            modalVariant={
              actionMenuType === 'recordShow' ? 'tertiary' : 'primary'
            }
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
    actionMenuType,
    addActionMenuEntry,
    canDelete,
    closeRightDrawer,
    contextStoreNumberOfSelectedRecords,
    handleDeleteClick,
    isDeleteRecordsModalOpen,
    position,
    removeActionMenuEntry,
  ]);

  return null;
};
