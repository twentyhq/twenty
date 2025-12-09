import { ActionModal } from '@/action-menu/actions/components/ActionModal';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { t } from '@lingui/core/macro';

export const RestoreSingleRecordAction = () => {
  const { recordIndexId, objectMetadataItem } =
    useRecordIndexIdFromCurrentContextStore();

  const recordId = useSelectedRecordIdOrThrow();

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);
  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const { restoreManyRecords } = useRestoreManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const handleRestoreClick = async () => {
    removeSelectedRecordsFromRecordBoard();
    resetTableRowSelection();

    await restoreManyRecords({
      idsToRestore: [recordId],
    });
  };

  return (
    <ActionModal
      title={t`Restore Record`}
      subtitle={t`Are you sure you want to restore this record?`}
      onConfirmClick={handleRestoreClick}
      confirmButtonText={t`Restore Record`}
      confirmButtonAccent="default"
    />
  );
};
