import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useIncrementalDestroyManyRecords } from '@/object-record/hooks/useIncrementalDestroyManyRecords';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { t } from '@lingui/core/macro';
import { AppPath, type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DestroyRecordsCommand = () => {
  const { recordIndexId, objectMetadataItem, selectedRecords, graphqlFilter } =
    useHeadlessCommandContextApi();

  if (!isDefined(recordIndexId) || !isDefined(objectMetadataItem)) {
    throw new Error(
      'Record index ID and object metadata are required to destroy records',
    );
  }

  const isSingleRecord = selectedRecords.length === 1;

  const navigateApp = useNavigateApp();

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);
  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const noMatchFilter: RecordGqlOperationFilter = { id: { in: [] } };

  const deletedAtFilter: RecordGqlOperationFilter = {
    deletedAt: { is: 'NOT_NULL' },
  };

  const combinedFilter: RecordGqlOperationFilter = {
    ...(graphqlFilter ?? noMatchFilter),
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

    if (!isDefined(graphqlFilter)) {
      throw new Error('Cannot destroy records without a valid filter');
    }

    await incrementalDestroyManyRecords();

    if (isSingleRecord) {
      navigateApp(AppPath.RecordIndexPage, {
        objectNamePlural: objectMetadataItem.namePlural,
      });
    }
  };

  const objectLabel = isSingleRecord
    ? objectMetadataItem.labelSingular
    : objectMetadataItem.labelPlural;

  const title = t`Permanently Destroy ${objectLabel}`;
  const subtitle = isSingleRecord
    ? t`Are you sure you want to destroy this ${objectMetadataItem.labelSingular}? It cannot be recovered anymore.`
    : t`Are you sure you want to destroy these ${objectMetadataItem.labelPlural}? They won't be recoverable anymore.`;
  const confirmButtonText = `${t`Permanently Destroy`} ${objectLabel}`;

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={title}
      subtitle={subtitle}
      confirmButtonText={confirmButtonText}
      execute={handleExecute}
    />
  );
};
