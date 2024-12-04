import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useCallback, useContext, useState } from 'react';
import { IconTrash, isDefined } from 'twenty-ui';

export const useDeleteSingleRecordAction = ({
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

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { sortedFavorites: favorites } = useFavorites();
  const { deleteFavorite } = useDeleteFavorite();

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const { closeRightDrawer } = useRightDrawer();

  const recordIdToDelete =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds?.[0]
      : undefined;

  const handleDeleteClick = useCallback(async () => {
    if (!isDefined(recordIdToDelete)) {
      return;
    }

    resetTableRowSelection();

    const foundFavorite = favorites?.find(
      (favorite) => favorite.recordId === recordIdToDelete,
    );

    if (isDefined(foundFavorite)) {
      deleteFavorite(foundFavorite.id);
    }

    await deleteOneRecord(recordIdToDelete);
  }, [
    deleteFavorite,
    deleteOneRecord,
    favorites,
    recordIdToDelete,
    resetTableRowSelection,
  ]);

  const isRemoteObject = objectMetadataItem.isRemote;

  const { isInRightDrawer, onActionExecutedCallback } =
    useContext(ActionMenuContext);

  const registerDeleteSingleRecordAction = () => {
    if (isRemoteObject || !isDefined(recordIdToDelete)) {
      return;
    }

    addActionMenuEntry({
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      key: 'delete-single-record',
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
          title={'Delete Record'}
          subtitle={
            'Are you sure you want to delete this record? It can be recovered from the Options menu.'
          }
          onConfirmClick={() => {
            handleDeleteClick();
            onActionExecutedCallback?.();
            if (isInRightDrawer) {
              closeRightDrawer();
            }
          }}
          deleteButtonText={'Delete Record'}
        />
      ),
    });
  };

  const unregisterDeleteSingleRecordAction = () => {
    removeActionMenuEntry('delete-single-record');
  };

  return {
    registerDeleteSingleRecordAction,
    unregisterDeleteSingleRecordAction,
  };
};
