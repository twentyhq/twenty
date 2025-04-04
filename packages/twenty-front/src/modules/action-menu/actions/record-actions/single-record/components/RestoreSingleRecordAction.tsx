import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useCallback, useState } from 'react';

export const RestoreSingleRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const [isRestoreRecordModalOpen, setIsRestoreRecordModalOpen] =
    useState(true);

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

  const handleConfirmClick = () => {
    handleRestoreClick();
  };

  return (
    <>
      <Action onClick={() => setIsRestoreRecordModalOpen(true)} />
      {isRestoreRecordModalOpen && (
        <ConfirmationModal
          isOpen={isRestoreRecordModalOpen}
          setIsOpen={setIsRestoreRecordModalOpen}
          title={'Restore Record'}
          subtitle={'Are you sure you want to restore this record?'}
          onConfirmClick={handleConfirmClick}
          confirmButtonText={'Restore Record'}
        />
      )}
    </>
  );
};
