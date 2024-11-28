import { useContext, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { useLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLoadRecordIndexTable';
import { ROW_HEIGHT } from '@/object-record/record-table/constants/RowHeight';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { hasRecordTableFetchedAllRecordsComponentStateV2 } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentStateV2';
import { tableLastRowVisibleComponentState } from '@/object-record/record-table/states/tableLastRowVisibleComponentState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isNonEmptyString } from '@sniptt/guards';
import { useScrollToPosition } from '~/hooks/useScrollToPosition';
import { tableLastFetchFailedComponentState } from '@/object-record/record-table/states/tableLastFetchFailedComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { isDefined } from 'twenty-ui';

export const RecordTableNoRecordGroupBodyEffect = () => {
  const { objectNameSingular } = useContext(RecordTableContext);

  const [hasInitializedScroll, setHasInitializedScroll] = useState(false);

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

  const tableLastRowVisible = useRecoilComponentValueV2(
    tableLastRowVisibleComponentState,
  );

  const [lastFetchFailed, setLastFetchFailed] = useRecoilComponentStateV2(
    tableLastFetchFailedComponentState,
  );

  const setHasRecordTableFetchedAllRecordsComponents =
    useSetRecoilComponentStateV2(
      hasRecordTableFetchedAllRecordsComponentStateV2,
    );

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

        setHasInitializedScroll(true);
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
      setRecordTableData({
        records,
        totalCount,
      });
    }
  }, [records, totalCount, setRecordTableData, loading]);

  const fetchMoreDebouncedIfRequested = useDebouncedCallback(async () => {
    // We are debouncing here to give the user some room to scroll if they want to within this throttle window
    return await fetchMoreRecords();
  }, 100);

  useEffect(() => {
    const allRecordsHaveBeenFetched = !hasNextPage;

    setHasRecordTableFetchedAllRecordsComponents(allRecordsHaveBeenFetched);
  }, [hasNextPage, setHasRecordTableFetchedAllRecordsComponents]);

  useEffect(() => {
    (async () => {
      if (
        !isFetchingMoreObjects &&
        tableLastRowVisible &&
        hasNextPage &&
        !lastFetchFailed
      ) {
        const result = await fetchMoreDebouncedIfRequested();
        if (isDefined(result?.error)) {
          setLastFetchFailed(true);
        }
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
