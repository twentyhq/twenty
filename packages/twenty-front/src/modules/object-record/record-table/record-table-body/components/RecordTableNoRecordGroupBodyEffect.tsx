import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { ROW_HEIGHT } from '@/object-record/record-table/constants/RowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useSetRecordTableData } from '@/object-record/record-table/hooks/internal/useSetRecordTableData';
import { hasRecordTableFetchedAllRecordsComponentState } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentState';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { useScrollToPosition } from '@/ui/utilities/scroll/hooks/useScrollToPosition';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { isNonEmptyString } from '@sniptt/guards';

export const RecordTableNoRecordGroupBodyEffect = () => {
  const { objectNameSingular, recordTableId } = useRecordTableContextOrThrow();

  const { records, loading, hasNextPage } =
    useRecordIndexTableQuery(objectNameSingular);

  const setRecordTableData = useSetRecordTableData({
    recordTableId,
  });

  const showAuthModal = useShowAuthModal();

  const [hasInitializedScroll, setHasInitializedScroll] = useState(false);

  const setHasRecordTableFetchedAllRecordsComponents =
    useSetRecoilComponentState(hasRecordTableFetchedAllRecordsComponentState);
  const setIsRecordTableInitialLoading = useSetRecoilComponentState(
    isRecordTableInitialLoadingComponentState,
  );
  const isFetchingMoreRecords = useRecoilValue(
    isFetchingMoreRecordsFamilyState(recordTableId),
  );

  const [lastShowPageRecordId] = useRecoilState(lastShowPageRecordIdState);

  const { scrollToPosition } = useScrollToPosition();

  useEffect(() => {
    if (!loading && !isFetchingMoreRecords) {
      setRecordTableData({
        records,
      });
      setHasRecordTableFetchedAllRecordsComponents(!hasNextPage);
      setIsRecordTableInitialLoading(false);
    }
  }, [
    hasNextPage,
    isFetchingMoreRecords,
    loading,
    records,
    setHasRecordTableFetchedAllRecordsComponents,
    setIsRecordTableInitialLoading,
    setRecordTableData,
    showAuthModal,
  ]);

  useEffect(() => {
    if (hasInitializedScroll) {
      return;
    }

    if (isNonEmptyString(lastShowPageRecordId)) {
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
  }, [hasInitializedScroll, lastShowPageRecordId, records, scrollToPosition]);

  return <></>;
};
