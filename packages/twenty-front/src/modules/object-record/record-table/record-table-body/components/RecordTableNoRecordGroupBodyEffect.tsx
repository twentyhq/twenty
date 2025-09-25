import { useEffect } from 'react';

import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useSetRecordTableData } from '@/object-record/record-table/hooks/internal/useSetRecordTableData';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useInitializeRowVirtualization } from '@/object-record/record-table/virtualization/hooks/useInitializeRowVirtualization';
import { hasAlreadyFetchedUpToRealIndexComponentState } from '@/object-record/record-table/virtualization/states/hasAlreadyFetchedUpToRealIndexComponentState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableNoRecordGroupBodyEffect = () => {
  const { objectNameSingular, recordTableId } = useRecordTableContextOrThrow();

  const { records, loading, totalCount } =
    useRecordIndexTableQuery(objectNameSingular);

  const setRecordTableData = useSetRecordTableData({
    recordTableId,
  });

  const setHasAlreadyFetchedUpToRealIndex = useSetRecoilComponentState(
    hasAlreadyFetchedUpToRealIndexComponentState,
  );

  const [isRecordTableInitialLoading, setIsRecordTableInitialLoading] =
    useRecoilComponentState(isRecordTableInitialLoadingComponentState);

  const setTotalNumberOfRecordsToVirtualize = useSetRecoilComponentState(
    totalNumberOfRecordsToVirtualizeComponentState,
  );

  const { initializeRowsVirtualization } = useInitializeRowVirtualization();

  useEffect(() => {
    if (isRecordTableInitialLoading && !loading) {
      setRecordTableData({
        records,
      });

      if (isDefined(totalCount)) {
        setTotalNumberOfRecordsToVirtualize(totalCount);
      }

      initializeRowsVirtualization(records);

      setHasAlreadyFetchedUpToRealIndex(records.length);

      setIsRecordTableInitialLoading(false);
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
  ]);

  // useEffect(() => {
  //   if (hasInitializedScroll) {
  //     return;
  //   }

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
