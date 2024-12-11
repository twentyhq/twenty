import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useLazyLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLazyLoadRecordIndexTable';
import { recordIndexHasFetchedAllRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexHasFetchedAllRecordsByGroupComponentState';
import { ROW_HEIGHT } from '@/object-record/record-table/constants/RowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useSetRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyStateV2';
import { isNonEmptyString, isNull } from '@sniptt/guards';
import { useScrollToPosition } from '~/hooks/useScrollToPosition';

export const RecordTableRecordGroupBodyEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const recordGroupId = useCurrentRecordGroupId();

  const [hasInitializedScroll, setHasInitializedScroll] = useState(false);

  const {
    findManyRecords,
    records,
    totalCount,
    setRecordTableData,
    loading,
    hasNextPage,
  } = useLazyLoadRecordIndexTable(objectNameSingular);

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
    if (isNull(currentWorkspaceMember)) {
      return;
    }

    findManyRecords();
  }, [currentWorkspaceMember, findManyRecords]);

  return <></>;
};
