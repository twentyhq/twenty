import { useContext, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLoadRecordIndexTable';
import { recordIndexHasFetchedAllRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexHasFetchedAllRecordsByGroupComponentState';
import { recordIndexShouldFetchMoreRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexShouldFetchMoreRecordsByGroupComponentState';
import { ROW_HEIGHT } from '@/object-record/record-table/constants/RowHeight';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyStateV2';
import { useSetRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyStateV2';
import { isNonEmptyString } from '@sniptt/guards';
import { useScrollToPosition } from '~/hooks/useScrollToPosition';

export const RecordTableRecordGroupBodyEffect = () => {
  const { objectNameSingular } = useContext(RecordTableContext);

  const recordGroupId = useCurrentRecordGroupId();

  const [hasInitializedScroll, setHasInitializedScroll] = useState(false);

  const [shouldFetchMoreRecords, setShouldFetchMoreRecords] =
    useRecoilComponentFamilyStateV2(
      recordIndexShouldFetchMoreRecordsByGroupComponentState,
      recordGroupId,
    );

  const {
    fetchMoreRecords,
    records,
    totalCount,
    setRecordTableData,
    loading,
    hasNextPage,
  } = useLoadRecordIndexTable(objectNameSingular);

  const setHasRecordFetchedAllRecordsComponents =
    useSetRecoilComponentFamilyStateV2(
      recordIndexHasFetchedAllRecordsByGroupComponentState,
      recordGroupId,
    );

  const [lastShowPageRecordId] = useRecoilState(lastShowPageRecordIdState);

  const { scrollToPosition } = useScrollToPosition();

  useEffect(() => {
    if (isNonEmptyString(lastShowPageRecordId) && !hasInitializedScroll) {
      const recordPosition = records.findIndex(
        (record) => record.id === lastShowPageRecordId,
      );

      if (recordPosition !== -1) {
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
  ]);

  useEffect(() => {
    if (!loading) {
      setRecordTableData({
        records,
        currentRecordGroupId: recordGroupId,
        totalCount,
      });
    }
  }, [records, totalCount, setRecordTableData, loading, recordGroupId]);

  useEffect(() => {
    const allRecordsHaveBeenFetched = !hasNextPage;

    setHasRecordFetchedAllRecordsComponents(allRecordsHaveBeenFetched);
  }, [hasNextPage, setHasRecordFetchedAllRecordsComponents]);

  useEffect(() => {
    if (shouldFetchMoreRecords) {
      fetchMoreRecords().finally(() => {
        setShouldFetchMoreRecords(false);
      });
    }
  }, [fetchMoreRecords, setShouldFetchMoreRecords, shouldFetchMoreRecords]);

  return <></>;
};
