import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { DELETE_MAX_COUNT } from '@/object-record/constants/DeleteMaxCount';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useFetchAllRecordIds } from '@/object-record/hooks/useFetchAllRecordIds';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useCallback, useContext, useState } from 'react';
import { IconTrash, isDefined } from 'twenty-ui';

export const useDeleteMultipleRecordsAction = ({
  objectMetadataItem,
}: {
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

  const { sortedFavorites: favorites } = useFavorites();
  const { deleteFavorite } = useDeleteFavorite();

  const contextStoreNumberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreFilters = useRecoilComponentValueV2(
    contextStoreFiltersComponentState,
  );

  const graphqlFilter = computeContextStoreFilters(
    contextStoreTargetedRecordsRule,
    contextStoreFilters,
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

  const { isInRightDrawer, onActionExecutedCallback } =
    useContext(ActionMenuContext);

  const registerDeleteMultipleRecordsAction = ({
    position,
  }: {
    position: number;
  }) => {
    if (canDelete) {
      addActionMenuEntry({
        type: ActionMenuEntryType.Standard,
        scope: ActionMenuEntryScope.RecordSelection,
        key: 'delete-multiple-records',
        label: 'Delete',
        position,
        Icon: IconTrash,
        accent: 'danger',
        isPinned: true,
        onClick: () => {
          setIsDeleteRecordsModalOpen(true);
        },
        ConfirmationModal: (
          <ConfirmationModal
            isOpen={isDeleteRecordsModalOpen}
            setIsOpen={setIsDeleteRecordsModalOpen}
            title={'Delete Records'}
            subtitle={`Are you sure you want to delete these records? They can be recovered from the Options menu.`}
            onConfirmClick={() => {
              handleDeleteClick();
              onActionExecutedCallback?.();
              if (isInRightDrawer) {
                closeRightDrawer();
              }
            }}
            deleteButtonText={'Delete Records'}
          />
        ),
      });
    }
  };

  const unregisterDeleteMultipleRecordsAction = () => {
    removeActionMenuEntry('delete-multiple-records');
  };

  return {
    registerDeleteMultipleRecordsAction,
    unregisterDeleteMultipleRecordsAction,
  };
};
