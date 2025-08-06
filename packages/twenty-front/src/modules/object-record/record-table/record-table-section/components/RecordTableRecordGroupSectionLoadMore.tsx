import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useRecordIndexTableFetchMore } from '@/object-record/record-index/hooks/useRecordIndexTableFetchMore';
import { recordIndexHasFetchedAllRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexHasFetchedAllRecordsByGroupComponentState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { IconArrowDown } from 'twenty-ui/display';

export const RecordTableRecordGroupSectionLoadMore = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const { fetchMoreRecordsLazy } =
    useRecordIndexTableFetchMore(objectNameSingular);

  const hasFetchedAllRecords = useRecoilComponentFamilyValue(
    recordIndexHasFetchedAllRecordsByGroupComponentState,
    currentRecordGroupId,
  );

  const recordIds = useRecoilComponentValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const handleLoadMore = () => {
    fetchMoreRecordsLazy();
  };

  if (hasFetchedAllRecords) {
    return null;
  }

  return (
    <RecordTableActionRow
      draggableId={`load-more-records-${currentRecordGroupId}`}
      draggableIndex={recordIds.length + 1}
      LeftIcon={IconArrowDown}
      text="Load more"
      onClick={handleLoadMore}
    />
  );
};
