import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { t } from '@lingui/core/macro';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const RestoreMultipleRecordsCommand = () => {
  const { recordIndexId, objectMetadataItem, graphqlFilter } =
    useHeadlessCommandContextApi();

  if (
    !isDefined(recordIndexId) ||
    !isDefined(objectMetadataItem) ||
    !isDefined(graphqlFilter)
  ) {
    throw new Error(
      'Record index ID, object metadata item, and graphql filter are required to restore multiple records',
    );
  }

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);
  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const { restoreManyRecords } = useRestoreManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const deletedAtFilter: RecordGqlOperationFilter = {
    deletedAt: { is: 'NOT_NULL' },
  };

  const combinedFilter = {
    ...graphqlFilter,
    ...deletedAtFilter,
  };

  const { fetchAllRecords: fetchAllRecordIds } = useLazyFetchAllRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: combinedFilter,
    limit: DEFAULT_QUERY_PAGE_SIZE,
    recordGqlFields: { id: true },
  });

  const handleExecute = async () => {
    removeSelectedRecordsFromRecordBoard();
    const recordsToRestore = await fetchAllRecordIds();
    const recordIdsToRestore = recordsToRestore.map((record) => record.id);

    resetTableRowSelection();

    await restoreManyRecords({
      idsToRestore: recordIdsToRestore,
    });
  };

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={t`Restore Records`}
      subtitle={t`Are you sure you want to restore these records?`}
      confirmButtonText={t`Restore Records`}
      confirmButtonAccent="default"
      execute={handleExecute}
    />
  );
};
