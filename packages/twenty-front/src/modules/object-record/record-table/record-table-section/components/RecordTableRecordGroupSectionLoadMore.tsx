import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useRecordIndexTableFetchMore } from '@/object-record/record-index/hooks/useRecordIndexTableFetchMore';
import { recordIndexHasFetchedAllRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexHasFetchedAllRecordsByGroupComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { t } from '@lingui/core/macro';
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

  const handleLoadMore = () => {
    fetchMoreRecordsLazy();
  };

  if (hasFetchedAllRecords) {
    return null;
  }

  return (
    <RecordTableActionRow
      LeftIcon={IconArrowDown}
      text={t`Load more`}
      onClick={handleLoadMore}
    />
  );
};
