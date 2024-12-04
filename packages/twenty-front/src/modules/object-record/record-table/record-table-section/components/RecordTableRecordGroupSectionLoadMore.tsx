import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordIndexHasFetchedAllRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexHasFetchedAllRecordsByGroupComponentState';
import { recordIndexShouldFetchMoreRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexShouldFetchMoreRecordsByGroupComponentState';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useSetRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyStateV2';
import { IconArrowDown } from 'twenty-ui';

export const RecordTableRecordGroupSectionLoadMore = () => {
  const currentRecordGroupId = useCurrentRecordGroupId();

  const hasFetchedAllRecords = useRecoilComponentFamilyValueV2(
    recordIndexHasFetchedAllRecordsByGroupComponentState,
    currentRecordGroupId,
  );

  const setShouldFetchMoreRecords = useSetRecoilComponentFamilyStateV2(
    recordIndexShouldFetchMoreRecordsByGroupComponentState,
    currentRecordGroupId,
  );

  const handleLoadMore = () => {
    setShouldFetchMoreRecords(true);
  };

  if (hasFetchedAllRecords) {
    return null;
  }

  return (
    <RecordTableActionRow
      LeftIcon={IconArrowDown}
      text="Load more"
      onClick={handleLoadMore}
    />
  );
};
