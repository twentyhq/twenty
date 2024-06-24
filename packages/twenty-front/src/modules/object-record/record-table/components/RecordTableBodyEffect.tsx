import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLoadRecordIndexTable';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
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
  } = useLoadRecordIndexTable(objectNameSingular);

  const [isFetchingMoreObjects, setIsFetchingMoreObjects] =
    useState<boolean>(false);

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

  useEffect(() => {
    // We are adding a setTimeout here to give the user some room to scroll if they want to
    setTimeout(async () => {
      if (!isFetchingMoreObjects && tableLastRowVisible) {
        setIsFetchingMoreObjects(true);
        await fetchMoreObjects();
        setIsFetchingMoreObjects(false);
      }
    }, 100);
  }, [fetchMoreObjects, isFetchingMoreObjects, tableLastRowVisible]);

  return <></>;
};
