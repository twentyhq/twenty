import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useObjectRecordTable } from '@/object-record/hooks/useObjectRecordTable';
import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';

export const RecordTableBodyEffect = () => {
  const {
    fetchMoreRecords: fetchMoreObjects,
    records,
    setRecordTableData,
    queryStateIdentifier,
    loading,
  } = useObjectRecordTable();
  const { tableLastRowVisibleState } = useRecordTableScopedStates();
  const [tableLastRowVisible, setTableLastRowVisible] = useRecoilState(
    tableLastRowVisibleState,
  );

  const isFetchingMoreObjects = useRecoilValue(
    isFetchingMoreRecordsFamilyState(queryStateIdentifier),
  );

  useEffect(() => {
    if (!loading) {
      setRecordTableData(records);
    }
  }, [records, setRecordTableData, loading]);

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
