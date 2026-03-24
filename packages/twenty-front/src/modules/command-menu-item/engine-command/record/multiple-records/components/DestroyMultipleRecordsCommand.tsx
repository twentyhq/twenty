import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useIncrementalDestroyManyRecords } from '@/object-record/hooks/useIncrementalDestroyManyRecords';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { t } from '@lingui/core/macro';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const DestroyMultipleRecordsCommand = () => {
  const { recordIndexId, objectMetadataItem, graphqlFilter } =
    useHeadlessCommandContextApi();

  if (
    !isDefined(recordIndexId) ||
    !isDefined(objectMetadataItem) ||
    !isDefined(graphqlFilter)
  ) {
    throw new Error(
      'Record index ID, object metadata item, and graphql filter are required to destroy multiple records',
    );
  }

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);
  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const deletedAtFilter: RecordGqlOperationFilter = {
    deletedAt: { is: 'NOT_NULL' },
  };

  const combinedFilter = {
    ...graphqlFilter,
    ...deletedAtFilter,
  };

  const { incrementalDestroyManyRecords } = useIncrementalDestroyManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: combinedFilter,
    pageSize: DEFAULT_QUERY_PAGE_SIZE,
    delayInMsBetweenMutations: 50,
  });

  const handleExecute = async () => {
    removeSelectedRecordsFromRecordBoard();

    resetTableRowSelection();

    await incrementalDestroyManyRecords();
  };

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={t`Permanently Destroy Records`}
      subtitle={t`Are you sure you want to destroy these records? They won't be recoverable anymore.`}
      confirmButtonText={t`Destroy Records`}
      execute={handleExecute}
    />
  );
};
