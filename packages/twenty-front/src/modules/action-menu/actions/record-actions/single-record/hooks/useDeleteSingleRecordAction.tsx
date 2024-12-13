import { SingleRecordActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/singleRecordActionHook';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { useCallback, useContext, useState } from 'react';
import { isDefined } from 'twenty-ui';

export const useDeleteSingleRecordAction: SingleRecordActionHookWithObjectMetadataItem =
  ({ recordId, objectMetadataItem }) => {
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

    const shouldBeRegistered = !isRemoteObject;

    const onClick = () => {
      if (!shouldBeRegistered) {
        return;
      }

      setIsDeleteRecordsModalOpen(true);
    };

    return {
      shouldBeRegistered,
      onClick,
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
    };
  };
