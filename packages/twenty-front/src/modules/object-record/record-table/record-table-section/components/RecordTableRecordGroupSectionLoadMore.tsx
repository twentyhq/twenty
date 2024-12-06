import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useLazyLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLazyLoadRecordIndexTable';
import { recordIndexHasFetchedAllRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexHasFetchedAllRecordsByGroupComponentState';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useContext } from 'react';
import { IconArrowDown } from 'twenty-ui';

export const RecordTableRecordGroupSectionLoadMore = () => {
  const { objectNameSingular } = useContext(RecordTableContext);

  const currentRecordGroupId = useCurrentRecordGroupId();

  const { fetchMoreRecords } = useLazyLoadRecordIndexTable(objectNameSingular);

  const hasFetchedAllRecords = useRecoilComponentFamilyValueV2(
    recordIndexHasFetchedAllRecordsByGroupComponentState,
    currentRecordGroupId,
  );

  const handleLoadMore = () => {
    fetchMoreRecords();
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
