import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { useCallback, useContext, useState } from 'react';
import { IconTrash, isDefined } from 'twenty-ui';

export const useDeleteSingleRecordAction = ({
  recordId,
  objectMetadataItem,
}: {
  recordId: string;
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

  const { closeRightDrawer } = useRightDrawer();

  const handleDeleteClick = useCallback(async () => {
    resetTableRowSelection();

    const foundFavorite = favorites?.find(
      (favorite) => favorite.recordId === recordId,
    );

    if (isDefined(foundFavorite)) {
      deleteFavorite(foundFavorite.id);
    }

    await deleteOneRecord(recordId);
  }, [
    deleteFavorite,
    deleteOneRecord,
    favorites,
    resetTableRowSelection,
    recordId,
  ]);

  const isRemoteObject = objectMetadataItem.isRemote;

  const { isInRightDrawer, onActionExecutedCallback } =
    useContext(ActionMenuContext);

  const registerDeleteSingleRecordAction = ({
    position,
  }: {
    position: number;
  }) => {
    if (isRemoteObject) {
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
