import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

import { useLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLoadRecordIndexTable';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useScrollRestoration } from '~/hooks/useScrollRestoration';

type RecordTableBodyEffectProps = {
  objectNameSingular: string;
};

export const RecordTableBodyEffect = ({
  objectNameSingular,
}: RecordTableBodyEffectProps) => {
  const {
    fetchMoreRecords: fetchMoreObjects,
    records,
    totalCount,
    setRecordTableData,
    loading,
    queryStateIdentifier,
  } = useLoadRecordIndexTable(objectNameSingular);

  const isFetchingMoreObjects = useRecoilValue(
    isFetchingMoreRecordsFamilyState(queryStateIdentifier),
  );

  const { tableLastRowVisibleState } = useRecordTableStates();

  const tableLastRowVisible = useRecoilValue(tableLastRowVisibleState);

  const rowHeight = 32;
  const viewportHeight = records.length * rowHeight;

  useScrollRestoration(viewportHeight);

  useEffect(() => {
    if (!loading) {
      setRecordTableData(records, totalCount);
    }
  }, [records, totalCount, setRecordTableData, loading]);

  const fetchMoreDebouncedIfRequested = useDebouncedCallback(async () => {
    // We are debouncing here to give the user some room to scroll if they want to within this throttle window
    await fetchMoreObjects();
  }, 100);

  useEffect(() => {
    if (!isFetchingMoreObjects && tableLastRowVisible) {
      fetchMoreDebouncedIfRequested();
    }
  }, [
    fetchMoreDebouncedIfRequested,
    isFetchingMoreObjects,
    tableLastRowVisible,
  ]);

  return <></>;
};
