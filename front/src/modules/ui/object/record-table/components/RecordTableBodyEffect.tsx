import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useObjectRecordTable } from '@/object-record/hooks/useObjectRecordTable';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useRecordTableScopedStates } from '@/ui/object/record-table/hooks/internal/useRecordTableScopedStates';

export const RecordTableBodyEffect = () => {
  const {
    fetchMoreRecords: fetchMoreObjects,
    records,
    setRecordTableData,
    queryStateIdentifier,
  } = useObjectRecordTable();
  const { tableLastRowVisibleState } = useRecordTableScopedStates();
  const [tableLastRowVisible, setTableLastRowVisible] = useRecoilState(
    tableLastRowVisibleState,
  );

  const isFetchingMoreObjects = useRecoilValue(
    isFetchingMoreRecordsFamilyState(queryStateIdentifier),
  );

  useEffect(() => {
    setRecordTableData(records);
  }, [records, setRecordTableData]);

  useEffect(() => {
    if (tableLastRowVisible && !isFetchingMoreObjects) {
      fetchMoreObjects();
    }
  }, [
    fetchMoreObjects,
    isFetchingMoreObjects,
    setTableLastRowVisible,
    tableLastRowVisible,
  ]);

  return <></>;
};
