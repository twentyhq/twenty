import { useEffect } from 'react';

import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useSetRecordTableData } from '@/object-record/record-table/hooks/internal/useSetRecordTableData';
import { hasRecordTableFetchedAllRecordsComponentState } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentState';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { useInitializeRowVirtualization } from '@/object-record/record-table/virtualization/hooks/useInitializeRowVirtualization';
import { hasAlreadyFetchedUpToRealIndexComponentState } from '@/object-record/record-table/virtualization/states/hasAlreadyFetchedUpToRealIndexComponentState';
import { lastRecordTableQueryIdentifierComponentState } from '@/object-record/record-table/virtualization/states/lastRecordTableQueryIdentifierComponentState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { useScrollToPosition } from '@/ui/utilities/scroll/hooks/useScrollToPosition';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableNoRecordGroupBodyEffect = () => {
  const { objectNameSingular, recordTableId } = useRecordTableContextOrThrow();

  const { records, loading, totalCount, hasNextPage, queryIdentifier } =
    useRecordIndexTableQuery(objectNameSingular);

  const setRecordTableData = useSetRecordTableData({
    recordTableId,
  });

  const setHasAlreadyFetchedUpToRealIndex = useSetRecoilComponentState(
    hasAlreadyFetchedUpToRealIndexComponentState,
  );

  const [isRecordTableInitialLoading, setIsRecordTableInitialLoading] =
    useRecoilComponentState(isRecordTableInitialLoadingComponentState);

  const [lastRecordTableQueryIdentifier, setLastRecordTableQueryIdentifier] =
    useRecoilComponentState(lastRecordTableQueryIdentifierComponentState);

  const [
    totalNumberOfRecordsToVirtualize,
    setTotalNumberOfRecordsToVirtualize,
  ] = useRecoilComponentState(totalNumberOfRecordsToVirtualizeComponentState);

  const setHasRecordTableFetchedAllRecords = useSetRecoilComponentState(
    hasRecordTableFetchedAllRecordsComponentState,
  );

  const { initializeRowsVirtualization } = useInitializeRowVirtualization();

  const { scrollToPosition } = useScrollToPosition();

  useEffect(() => {
    if (!loading) {
      setRecordTableData({
        records,
      });

      if (isDefined(totalCount)) {
        if (totalCount > NUMBER_OF_VIRTUALIZED_ROWS) {
          if (totalNumberOfRecordsToVirtualize !== totalCount) {
            setTotalNumberOfRecordsToVirtualize(totalCount);
          }
        } else {
          if (totalNumberOfRecordsToVirtualize !== records.length) {
            setTotalNumberOfRecordsToVirtualize(records.length);
          }
        }
      }

      if (isRecordTableInitialLoading) {
        initializeRowsVirtualization();

        scrollToPosition(0);

        setHasAlreadyFetchedUpToRealIndex(records.length);

        setHasRecordTableFetchedAllRecords(records.length === totalCount);

        setIsRecordTableInitialLoading(false);
      }

      if (queryIdentifier !== lastRecordTableQueryIdentifier) {
        setLastRecordTableQueryIdentifier(queryIdentifier);

        scrollToPosition(0);
      }
    }
  }, [
    isRecordTableInitialLoading,
    setIsRecordTableInitialLoading,
    setRecordTableData,
    records,
    loading,
    totalCount,
    setTotalNumberOfRecordsToVirtualize,
    initializeRowsVirtualization,
    setHasAlreadyFetchedUpToRealIndex,
    scrollToPosition,
    setHasRecordTableFetchedAllRecords,
    hasNextPage,
    queryIdentifier,
    lastRecordTableQueryIdentifier,
    setLastRecordTableQueryIdentifier,
    totalNumberOfRecordsToVirtualize,
  ]);

  // useEffect(() => {
  //   if (isNonEmptyString(lastShowPageRecordId)) {
  //     const isRecordAlreadyFetched = records.some(
  //       (record) => record.id === lastShowPageRecordId,
  //     );

  //     if (isRecordAlreadyFetched) {
  //       const recordPosition = records.findIndex(
  //         (record) => record.id === lastShowPageRecordId,
  //       );

  //       const positionInPx = recordPosition * RECORD_TABLE_ROW_HEIGHT;

  //       scrollToPosition(positionInPx);

  //       setHasInitializedScroll(true);
  //     }
  //   }
  // }, [hasInitializedScroll, lastShowPageRecordId, records, scrollToPosition]);

  return <></>;
};
