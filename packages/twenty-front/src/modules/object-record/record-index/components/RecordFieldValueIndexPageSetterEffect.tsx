import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useSetRecordValue } from '@/object-record/record-index/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const RecordFieldValueIndexPageSetterEffect = ({
  recordIndexId,
}: {
  recordIndexId: string;
}) => {
  const setRecordValue = useSetRecordValue();

  const { tableRowIdsState } = useRecordTableStates(recordIndexId);

  const tableRowIds = useRecoilValue(tableRowIdsState);

  const getTableRow = useRecoilCallback(
    ({ snapshot }) =>
      (rowId: string) => {
        return snapshot.getLoadable(recordStoreFamilyState(rowId)).getValue();
      },
    [],
  );

  useEffect(() => {
    for (const rowId of tableRowIds) {
      setRecordValue(rowId, getTableRow(rowId));
    }
  }, [tableRowIds, getTableRow, setRecordValue]);

  return null;
};
