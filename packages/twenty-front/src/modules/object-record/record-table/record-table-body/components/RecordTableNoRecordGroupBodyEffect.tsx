import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { useLazyLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLazyLoadRecordIndexTable';
import { ROW_HEIGHT } from '@/object-record/record-table/constants/RowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { hasRecordTableFetchedAllRecordsComponentStateV2 } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentStateV2';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { tableEncounteredUnrecoverableErrorComponentState } from '@/object-record/record-table/states/tableEncounteredUnrecoverableErrorComponentState';
import { tableLastRowVisibleComponentState } from '@/object-record/record-table/states/tableLastRowVisibleComponentState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { useScrollToPosition } from '@/ui/utilities/scroll/hooks/useScrollToPosition';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isNonEmptyString } from '@sniptt/guards';

export const RecordTableNoRecordGroupBodyEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const setIsRecordTableInitialLoading = useSetRecoilComponentStateV2(
    isRecordTableInitialLoadingComponentState,
  );

  const { setRecordTableData } = useRecordTable();

  const showAuthModal = useShowAuthModal();

  const [hasInitializedScroll, setHasInitializedScroll] = useState(false);

  const { findManyRecordsLazy, fetchMoreRecordsLazy, queryIdentifier } =
    useLazyLoadRecordIndexTable(objectNameSingular);

  const [isFetchingMoreObjects, setIsFetchingMoreObjects] = useRecoilState(
    isFetchingMoreRecordsFamilyState(queryIdentifier),
  );

  const tableLastRowVisible = useRecoilComponentValueV2(
    tableLastRowVisibleComponentState,
  );

  const [encounteredUnrecoverableError, setEncounteredUnrecoverableError] =
    useRecoilComponentStateV2(tableEncounteredUnrecoverableErrorComponentState);

  const setHasRecordTableFetchedAllRecordsComponents =
    useSetRecoilComponentStateV2(
      hasRecordTableFetchedAllRecordsComponentStateV2,
    );

  const [lastShowPageRecordId] = useRecoilState(lastShowPageRecordIdState);

  const { scrollToPosition } = useScrollToPosition();

  const fetchMoreDebouncedIfRequested = useDebouncedCallback(async () => {
    return await fetchMoreRecordsLazy();
  }, 100);

  useEffect(() => {
    (async () => {
      if (
        !isFetchingMoreObjects &&
        tableLastRowVisible &&
        !encounteredUnrecoverableError
      ) {
        setIsFetchingMoreObjects(true);
        const result = await fetchMoreDebouncedIfRequested();

        const isForbidden =
          result?.error?.graphQLErrors.some(
            (e) => e.extensions?.code === 'FORBIDDEN',
          ) ?? false;

        if (isForbidden) {
          setEncounteredUnrecoverableError(true);
        }
        setIsFetchingMoreObjects(false);
      }
    })();
  }, [
    lastShowPageRecordId,
    scrollToPosition,
    fetchMoreDebouncedIfRequested,
    isFetchingMoreObjects,
    tableLastRowVisible,
    encounteredUnrecoverableError,
    setEncounteredUnrecoverableError,
    setIsFetchingMoreObjects,
  ]);

  useEffect(() => {
    if (showAuthModal) {
      return;
    }

    const fetchRecords = async () => {
      const { records, totalCount, hasNextPage } = await findManyRecordsLazy();
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
        totalCount,
      });
      setIsRecordTableInitialLoading(false);
    };

    fetchRecords();
  }, [
    findManyRecordsLazy,
    hasInitializedScroll,
    lastShowPageRecordId,
    scrollToPosition,
    setHasRecordTableFetchedAllRecordsComponents,
    setIsRecordTableInitialLoading,
    showAuthModal,
  ]);

  return <></>;
};
