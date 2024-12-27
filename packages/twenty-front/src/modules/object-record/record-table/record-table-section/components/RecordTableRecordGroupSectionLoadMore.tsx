import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useLazyLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLazyLoadRecordIndexTable';
import { isRecordIndexLoadMoreLockedComponentState } from '@/object-record/record-index/states/isRecordIndexLoadMoreLockedComponentState';
import { recordIndexHasFetchedAllRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexHasFetchedAllRecordsByGroupComponentState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { IconArrowDown } from 'twenty-ui';

export const RecordTableRecordGroupSectionLoadMore = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const { fetchMoreRecords } = useLazyLoadRecordIndexTable(objectNameSingular);

  const hasFetchedAllRecords = useRecoilComponentFamilyValueV2(
    recordIndexHasFetchedAllRecordsByGroupComponentState,
    currentRecordGroupId,
  );

  const isLoadMoreLocked = useRecoilComponentValueV2(
    isRecordIndexLoadMoreLockedComponentState,
  );

  const recordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const handleLoadMore = () => {
    fetchMoreRecords();
  };

  if (hasFetchedAllRecords || isLoadMoreLocked) {
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
