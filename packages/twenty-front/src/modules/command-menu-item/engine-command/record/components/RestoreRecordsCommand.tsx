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

export const RestoreRecordsCommand = () => {
  const { recordIndexId, objectMetadataItem, selectedRecords, graphqlFilter } =
    useHeadlessCommandContextApi();

  if (!isDefined(recordIndexId) || !isDefined(objectMetadataItem)) {
    throw new Error(
      'Record index ID and object metadata are required to restore records',
    );
  }

  const isSingleRecord = selectedRecords.length === 1;

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);
  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const { restoreManyRecords } = useRestoreManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const noMatchFilter: RecordGqlOperationFilter = { id: { in: [] } };

  const deletedAtFilter: RecordGqlOperationFilter = {
    deletedAt: { is: 'NOT_NULL' },
  };

  const combinedFilter: RecordGqlOperationFilter = {
    ...(graphqlFilter ?? noMatchFilter),
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

    if (!isDefined(graphqlFilter)) {
      throw new Error('Cannot restore records without a valid filter');
    }

    const recordsToRestore = await fetchAllRecordIds();
    const recordIdsToRestore = recordsToRestore.map((record) => record.id);

    resetTableRowSelection();

    await restoreManyRecords({
      idsToRestore: recordIdsToRestore,
    });
  };

  const objectLabel = isSingleRecord
    ? objectMetadataItem.labelSingular
    : objectMetadataItem.labelPlural;

  const title = t`Restore ${objectLabel}`;
  const subtitle = isSingleRecord
    ? t`Are you sure you want to restore this ${objectMetadataItem.labelSingular}?`
    : t`Are you sure you want to restore these ${objectMetadataItem.labelPlural}?`;

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={title}
      subtitle={subtitle}
      confirmButtonText={title}
      confirmButtonAccent="default"
      execute={handleExecute}
    />
  );
};
