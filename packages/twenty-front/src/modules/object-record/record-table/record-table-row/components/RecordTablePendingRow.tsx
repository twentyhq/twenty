import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';

export const RecordTablePendingRow = () => {
  const { pendingRecordIdState } = useRecordTableStates();
  const pendingRecordId = useRecoilValue(pendingRecordIdState);

  if (!pendingRecordId) return <></>;

  return (
    <RecordTableRow
      key={pendingRecordId}
      recordId={pendingRecordId}
      rowIndex={-1}
      isPendingRow
    />
  );
};
