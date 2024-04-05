import { RecordTableRow } from '@/object-record/record-table/components/RecordTableRow';
import { usePendingRecordId } from '@/object-record/record-table/hooks/usePendingRecordId';

export const RecordTablePendingRow = () => {
  const { pendingRecordId } = usePendingRecordId();

  if (!pendingRecordId) return;

  return (
    <RecordTableRow
      key={pendingRecordId}
      recordId={pendingRecordId}
      rowIndex={-1}
    />
  );
};
