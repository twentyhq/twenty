import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DestroySingleRecordCommand = () => {
  const { recordIndexId, objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;

  if (
    !isDefined(recordId) ||
    !isDefined(recordIndexId) ||
    !isDefined(objectMetadataItem)
  ) {
    throw new Error(
      'Record ID, record index ID, and object metadata are required to destroy single record',
    );
  }

  const navigateApp = useNavigateApp();

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);

  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const { destroyOneRecord } = useDestroyOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const handleExecute = async () => {
    removeSelectedRecordsFromRecordBoard();
    resetTableRowSelection();

    await destroyOneRecord(recordId);
    navigateApp(AppPath.RecordIndexPage, {
      objectNamePlural: objectMetadataItem.namePlural,
    });
  };

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={t`Permanently Destroy Record`}
      subtitle={t`Are you sure you want to destroy this record? It cannot be recovered anymore.`}
      confirmButtonText={t`Permanently Destroy Record`}
      execute={handleExecute}
    />
  );
};
