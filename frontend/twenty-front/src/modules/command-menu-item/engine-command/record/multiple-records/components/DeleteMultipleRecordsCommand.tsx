import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useIncrementalDeleteManyRecords } from '@/object-record/hooks/useIncrementalDeleteManyRecords';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { isDefined } from 'twenty-shared/utils';

export const DeleteMultipleRecordsCommand = () => {
  const { recordIndexId, objectMetadataItem, graphqlFilter } =
    useHeadlessCommandContextApi();

  if (
    !isDefined(recordIndexId) ||
    !isDefined(objectMetadataItem) ||
    !isDefined(graphqlFilter)
  ) {
    throw new Error(
      'Record index ID, object metadata item, and graphql filter are required to delete multiple records',
    );
  }

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);

  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const { incrementalDeleteManyRecords } = useIncrementalDeleteManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: graphqlFilter,
    pageSize: DEFAULT_QUERY_PAGE_SIZE,
    delayInMsBetweenMutations: 50,
  });

  const handleExecute = async () => {
    removeSelectedRecordsFromRecordBoard();
    resetTableRowSelection();
    await incrementalDeleteManyRecords();
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
