import { useContext, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { useLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLoadRecordIndexTable';
import { ROW_HEIGHT } from '@/object-record/record-table/constants/RowHeight';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { hasRecordTableFetchedAllRecordsComponentStateV2 } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentStateV2';
import { isRecordTableScrolledLeftComponentState } from '@/object-record/record-table/states/isRecordTableScrolledLeftComponentState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useScrollLeftValue } from '@/ui/utilities/scroll/hooks/useScrollLeftValue';
import { useScrollTopValue } from '@/ui/utilities/scroll/hooks/useScrollTopValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { isNonEmptyString } from '@sniptt/guards';
import { useScrollToPosition } from '~/hooks/useScrollToPosition';

export const RecordTableBodyEffect = () => {
  const { objectNameSingular } = useContext(RecordTableContext);

  const [hasInitializedScroll, setHasInitiazedScroll] = useState(false);

  const {
    fetchMoreRecords,
    records,
    totalCount,
    setRecordTableData,
    loading,
    queryStateIdentifier,
    hasNextPage,
  } = useLoadRecordIndexTable(objectNameSingular);

  const isFetchingMoreObjects = useRecoilValue(
    isFetchingMoreRecordsFamilyState(queryStateIdentifier),
  );

  const { tableLastRowVisibleState } = useRecordTableStates();

  const tableLastRowVisible = useRecoilValue(tableLastRowVisibleState);

  const scrollTop = useScrollTopValue('recordTableWithWrappers');

  const setHasRecordTableFetchedAllRecordsComponents =
    useSetRecoilComponentState(hasRecordTableFetchedAllRecordsComponentStateV2);

  // TODO: move this outside because it might cause way too many re-renders for other hooks
  useEffect(() => {
    if (scrollTop > 0) {
      document
        .getElementById('record-table-header')
        ?.classList.add('header-sticky');
    } else {
      document
        .getElementById('record-table-header')
        ?.classList.remove('header-sticky');
    }
  }, [scrollTop]);

  const scrollLeft = useScrollLeftValue('recordTableWithWrappers');

  const setIsRecordTableScrolledLeft = useSetRecoilComponentState(
    isRecordTableScrolledLeftComponentState,
  );

  useEffect(() => {
    setIsRecordTableScrolledLeft(scrollLeft === 0);
    if (scrollLeft > 0) {
      document
        .getElementById('record-table-body')
        ?.classList.add('first-columns-sticky');
      document
        .getElementById('record-table-header')
        ?.classList.add('first-columns-sticky');
    } else {
      document
        .getElementById('record-table-body')
        ?.classList.remove('first-columns-sticky');
      document
        .getElementById('record-table-header')
        ?.classList.remove('first-columns-sticky');
    }
  }, [scrollLeft, setIsRecordTableScrolledLeft]);

  const [lastShowPageRecordId, setLastShowPageRecordId] = useRecoilState(
    lastShowPageRecordIdState,
  );

  const { scrollToPosition } = useScrollToPosition();

  useEffect(() => {
    if (isNonEmptyString(lastShowPageRecordId) && !hasInitializedScroll) {
      const isRecordAlreadyFetched = records.some(
        (record) => record.id === lastShowPageRecordId,
      );

      if (isRecordAlreadyFetched) {
        const recordPosition = records.findIndex(
          (record) => record.id === lastShowPageRecordId,
        );

        const positionInPx = recordPosition * ROW_HEIGHT;

        scrollToPosition(positionInPx);

        setHasInitiazedScroll(true);
      }
    }
  }, [
    loading,
    lastShowPageRecordId,
    records,
    scrollToPosition,
    hasInitializedScroll,
    setLastShowPageRecordId,
  ]);

  useEffect(() => {
    if (!loading) {
      setRecordTableData(records, totalCount);
    }
  }, [records, totalCount, setRecordTableData, loading]);

  const fetchMoreDebouncedIfRequested = useDebouncedCallback(async () => {
    // We are debouncing here to give the user some room to scroll if they want to within this throttle window
    await fetchMoreRecords();
  }, 100);

  useEffect(() => {
    const allRecordsHaveBeenFetched = !hasNextPage;

    setHasRecordTableFetchedAllRecordsComponents(allRecordsHaveBeenFetched);
  }, [hasNextPage, setHasRecordTableFetchedAllRecordsComponents]);

  useEffect(() => {
    (async () => {
      if (!isFetchingMoreObjects && tableLastRowVisible && hasNextPage) {
        await fetchMoreDebouncedIfRequested();
      }
    })();
  }, [
    hasNextPage,
    records,
    lastShowPageRecordId,
    scrollToPosition,
    fetchMoreDebouncedIfRequested,
    isFetchingMoreObjects,
    tableLastRowVisible,
  ]);

  return <></>;
};
