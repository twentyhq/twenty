import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { recordIndexHasFetchedAllRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexHasFetchedAllRecordsByGroupComponentState';
import { ROW_HEIGHT } from '@/object-record/record-table/constants/RowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useSetRecordTableData } from '@/object-record/record-table/hooks/internal/useSetRecordTableData';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useScrollToPosition } from '@/ui/utilities/scroll/hooks/useScrollToPosition';
import { useSetRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { isNonEmptyString } from '@sniptt/guards';

export const RecordTableRecordGroupBodyEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();
  const { recordTableId } = useRecordTableContextOrThrow();

  const setRecordTableData = useSetRecordTableData({
    recordTableId,
  });

  const setIsRecordTableInitialLoading = useSetRecoilComponentState(
    isRecordTableInitialLoadingComponentState,
  );

  const recordGroupId = useCurrentRecordGroupId();

  const { records, loading, hasNextPage } =
    useRecordIndexTableQuery(objectNameSingular);

  const setHasRecordFetchedAllRecordsComponents =
    useSetRecoilComponentFamilyState(
      recordIndexHasFetchedAllRecordsByGroupComponentState,
      recordGroupId,
    );

  const [lastShowPageRecordId] = useRecoilState(lastShowPageRecordIdState);

  const { scrollToPosition } = useScrollToPosition();

  useEffect(() => {
    if (!loading) {
      setRecordTableData({
        records,
        currentRecordGroupId: recordGroupId,
      });
      setIsRecordTableInitialLoading(false);
      setHasRecordFetchedAllRecordsComponents(!hasNextPage);
    }
  }, [
    hasNextPage,
    loading,
    records,
    recordGroupId,
    setHasRecordFetchedAllRecordsComponents,
    setIsRecordTableInitialLoading,
    setRecordTableData,
  ]);

  useEffect(() => {
    if (isNonEmptyString(lastShowPageRecordId)) {
      const recordPosition = records.findIndex(
        (record) => record.id === lastShowPageRecordId,
      );

      if (recordPosition !== -1) {
        const positionInPx = recordPosition * ROW_HEIGHT;

        scrollToPosition(positionInPx);
      }
    }
  }, [lastShowPageRecordId, records, scrollToPosition]);

  return <></>;
};
