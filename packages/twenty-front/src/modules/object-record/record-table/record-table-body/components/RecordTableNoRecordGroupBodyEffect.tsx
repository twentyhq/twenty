import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import {
  useLazyLoadRecordIndexTable,
  useRecordIndexTableQuery,
} from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { ROW_HEIGHT } from '@/object-record/record-table/constants/RowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useSetRecordTableData } from '@/object-record/record-table/hooks/internal/useSetRecordTableData';
import { hasRecordTableFetchedAllRecordsComponentStateV2 } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentStateV2';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { useScrollToPosition } from '@/ui/utilities/scroll/hooks/useScrollToPosition';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isNonEmptyString } from '@sniptt/guards';

export const RecordTableNoRecordGroupBodyEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const setIsRecordTableInitialLoading = useSetRecoilComponentStateV2(
    isRecordTableInitialLoadingComponentState,
  );

  const { records, loading, hasNextPage } =
    useRecordIndexTableQuery(objectNameSingular);

  const { recordTableId } = useRecordTableContextOrThrow();

  const setRecordTableData = useSetRecordTableData({
    recordTableId,
  });

  const showAuthModal = useShowAuthModal();

  const [hasInitializedScroll, setHasInitializedScroll] = useState(false);

  const { findManyRecordsLazy, queryIdentifier } =
    useLazyLoadRecordIndexTable(objectNameSingular);

  const [isFetchingMoreObjects, setIsFetchingMoreObjects] = useRecoilState(
    isFetchingMoreRecordsFamilyState(queryIdentifier),
  );

  const setHasRecordTableFetchedAllRecordsComponents =
    useSetRecoilComponentStateV2(
      hasRecordTableFetchedAllRecordsComponentStateV2,
    );

  const [lastShowPageRecordId] = useRecoilState(lastShowPageRecordIdState);

  const { scrollToPosition } = useScrollToPosition();

  useEffect(() => {
    if (!loading) {
      setRecordTableData({
        records,
      });
    }
  }, [loading, records, setRecordTableData]);

  useEffect(() => {
    if (showAuthModal || isFetchingMoreObjects) {
      return;
    }

    setIsFetchingMoreObjects(true);

    setHasRecordTableFetchedAllRecordsComponents(!hasNextPage);
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
    setRecordTableData({
      records,
    });
    setIsFetchingMoreObjects(false);
    setIsRecordTableInitialLoading(false);
  }, [
    findManyRecordsLazy,
    hasInitializedScroll,
    isFetchingMoreObjects,
    lastShowPageRecordId,
    scrollToPosition,
    setHasRecordTableFetchedAllRecordsComponents,
    setIsFetchingMoreObjects,
    setIsRecordTableInitialLoading,
    setRecordTableData,
    showAuthModal,
  ]);

  return <></>;
};
