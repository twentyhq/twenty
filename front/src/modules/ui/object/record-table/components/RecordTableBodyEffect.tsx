import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectRecordTable } from '@/object-record/hooks/useObjectRecordTable';
import { useRecordTableScopedStates } from '@/ui/object/record-table/hooks/internal/useRecordTableScopedStates';
import { isDefined } from '~/utils/isDefined';

export const RecordTableBodyEffect = () => {
  const { fetchMoreRecords: fetchMoreObjects } = useObjectRecordTable();
  const { tableLastRowVisibleState } = useRecordTableScopedStates();
  const tableLastRowVisible = useRecoilValue(tableLastRowVisibleState);

  useEffect(() => {
    if (tableLastRowVisible && isDefined(fetchMoreObjects)) {
      fetchMoreObjects();
    }
  }, [fetchMoreObjects, tableLastRowVisible]);

  return <></>;
};
