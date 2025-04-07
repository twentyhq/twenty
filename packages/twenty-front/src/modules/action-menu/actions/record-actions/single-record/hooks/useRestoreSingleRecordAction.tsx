import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useCallback, useState } from 'react';

export const useRestoreSingleRecordAction: ActionHookWithObjectMetadataItem = ({
  objectMetadataItem,
}) => {
  const recordId = useSelectedRecordIdOrThrow();

  const [isRestoreRecordModalOpen, setIsRestoreRecordModalOpen] =
    useState(false);

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: objectMetadataItem.namePlural,
  });

  const { restoreManyRecords } = useRestoreManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const handleRestoreClick = useCallback(async () => {
    resetTableRowSelection();

    await restoreManyRecords({
      idsToRestore: [recordId],
    });
  }, [restoreManyRecords, resetTableRowSelection, recordId]);

  const onClick = () => {
    setIsRestoreRecordModalOpen(true);
  };

  const handleConfirmClick = () => {
    handleRestoreClick();
  };

  return {
    onClick,
    ConfirmationModal: (
      <ConfirmationModal
        isOpen={isRestoreRecordModalOpen}
        setIsOpen={setIsRestoreRecordModalOpen}
        title={'Restore Record'}
        subtitle={'Are you sure you want to restore this record?'}
        onConfirmClick={handleConfirmClick}
        confirmButtonText={'Restore Record'}
      />
    ),
  };
};
