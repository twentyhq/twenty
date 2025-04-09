import { ActionModal } from '@/action-menu/actions/components/ActionModal';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';

export const RestoreSingleRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: objectMetadataItem.namePlural,
  });

  const { restoreManyRecords } = useRestoreManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const handleRestoreClick = async () => {
    resetTableRowSelection();

    await restoreManyRecords({
      idsToRestore: [recordId],
    });
  };

  return (
    <ActionModal
      title="Restore Record"
      subtitle="Are you sure you want to restore this record?"
      onConfirmClick={handleRestoreClick}
      confirmButtonText="Restore Record"
      confirmButtonAccent="default"
    />
  );
};
