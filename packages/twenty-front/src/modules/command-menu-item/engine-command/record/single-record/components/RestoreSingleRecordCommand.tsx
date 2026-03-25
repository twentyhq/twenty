import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const RestoreSingleRecordCommand = () => {
  const { recordIndexId, objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;

  if (
    !isDefined(recordId) ||
    !isDefined(recordIndexId) ||
    !isDefined(objectMetadataItem)
  ) {
    throw new Error(
      'Record ID, record index ID, and object metadata are required to restore single record',
    );
  }

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);
  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const { restoreManyRecords } = useRestoreManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const handleExecute = async () => {
    removeSelectedRecordsFromRecordBoard();
    resetTableRowSelection();

    await restoreManyRecords({
      idsToRestore: [recordId],
    });
  };

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={t`Restore Record`}
      subtitle={t`Are you sure you want to restore this record?`}
      confirmButtonText={t`Restore Record`}
      confirmButtonAccent="default"
      execute={handleExecute}
    />
  );
};
