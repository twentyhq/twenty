import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { recordIndexHasFetchedAllRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexHasFetchedAllRecordsByGroupComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { IconArrowDown } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

export const RecordTableRecordGroupSectionLoadMore = () => {
  const { t } = useLingui();
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const { fetchMoreRecords } = useRecordIndexTableQuery(objectNameSingular);

  const recordIndexHasFetchedAllRecordsByGroup =
    useAtomComponentFamilyStateValue(
      recordIndexHasFetchedAllRecordsByGroupComponentState,
      currentRecordGroupId,
    );

  const handleLoadMore = () => {
    fetchMoreRecords();
  };

  if (recordIndexHasFetchedAllRecordsByGroup) {
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
