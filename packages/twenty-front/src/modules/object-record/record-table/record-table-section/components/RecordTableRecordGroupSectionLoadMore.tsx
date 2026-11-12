import { isRecordGroupTabsDisplayedComponentSelector } from '@/object-record/record-group/states/selectors/isRecordGroupTabsDisplayedComponentSelector';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { recordIndexHasFetchedAllRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexHasFetchedAllRecordsByGroupComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowDown } from 'twenty-ui/icon';

const StyledFetchMoreTrigger = styled.div`
  height: 0;
`;

export const RecordTableRecordGroupSectionLoadMore = () => {
  const { t } = useLingui();
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const { fetchMoreRecords, loading } =
    useRecordIndexTableQuery(objectNameSingular);

  const recordIndexHasFetchedAllRecordsByGroup =
    useAtomComponentFamilyStateValue(
      recordIndexHasFetchedAllRecordsByGroupComponentState,
      currentRecordGroupId,
    );

  const isRecordGroupTabsDisplayed = useAtomComponentSelectorValue(
    isRecordGroupTabsDisplayedComponentSelector,
  );

  const [hasAutoloadFailed, setHasAutoloadFailed] = useState(false);

  const handleLoadMore = async () => {
    const fetchMoreResult = await fetchMoreRecords();

    setHasAutoloadFailed(isDefined(fetchMoreResult?.error));
  };

  const { ref: fetchMoreRef } = useInView({
    onChange: (inView) => {
      if (inView) {
        handleLoadMore();
      }
    },
  });

  if (recordIndexHasFetchedAllRecordsByGroup) {
    return null;
  }

  // A failed page falls back to the manual row, so the trigger cannot retry in a loop
  if (isRecordGroupTabsDisplayed && !hasAutoloadFailed) {
    // Remounting after each page fires the trigger again while it stays in view
    return loading ? null : <StyledFetchMoreTrigger ref={fetchMoreRef} />;
  }

  return (
    <RecordTableActionRow
      LeftIcon={IconArrowDown}
      text={t`Load more`}
      onClick={handleLoadMore}
    />
  );
};
