import { useRecoilValue } from 'recoil';

import { RecordTableRow } from '@/object-record/record-table/components/RecordTableRow';
import { recordTablePendingRecordIdState } from '@/object-record/record-table/states/recordTablePendingRecordIdState';

export const RecordTablePendingRow = () => {
  const recordTablePendingRecordId = useRecoilValue(
    recordTablePendingRecordIdState,
  );

  if (!recordTablePendingRecordId) return;

  return (
    <RecordTableRow
      key={recordTablePendingRecordId}
      recordId={recordTablePendingRecordId}
      rowIndex={-1}
    />
  );
};
