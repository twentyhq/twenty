import { useRecoilValue } from 'recoil';

import { RecordTableRow } from '@/object-record/record-table/components/RecordTableRow';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const RecordTablePendingRow = () => {
  const { pendingRecordIdState } = useRecordTableStates();
  const pendingRecordId = useRecoilValue(pendingRecordIdState);

  if (!pendingRecordId) return;

  return (
    <RecordTableRow
      key={pendingRecordId}
      recordId={pendingRecordId}
      rowIndex={-1}
      isPendingRow
    />
  );
};
