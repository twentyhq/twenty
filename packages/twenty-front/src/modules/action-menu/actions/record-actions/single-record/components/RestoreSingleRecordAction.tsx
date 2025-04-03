import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useCallback, useState } from 'react';

export const RestoreSingleRecordAction = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
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
    <ConfirmationModal
      isOpen={isRestoreRecordModalOpen}
      setIsOpen={setIsRestoreRecordModalOpen}
      title={'Restore Record'}
      subtitle={'Are you sure you want to restore this record?'}
      onConfirmClick={handleConfirmClick}
      confirmButtonText={'Restore Record'}
    />
  );
};
