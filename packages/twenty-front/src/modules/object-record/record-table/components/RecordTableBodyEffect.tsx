import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useObjectRecordTable } from '@/object-record/hooks/useObjectRecordTable';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';

type RecordTableBodyEffectProps = {
  objectNamePlural: string;
};

export const RecordTableBodyEffect = ({
  objectNamePlural,
}: RecordTableBodyEffectProps) => {
  const {
    fetchMoreRecords: fetchMoreObjects,
    records,
    setRecordTableData,
    queryStateIdentifier,
    loading,
  } = useObjectRecordTable(objectNamePlural);

  const { getTableLastRowVisibleState } = useRecordTableStates();

  const [tableLastRowVisible, setTableLastRowVisible] = useRecoilState(
    getTableLastRowVisibleState(),
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
