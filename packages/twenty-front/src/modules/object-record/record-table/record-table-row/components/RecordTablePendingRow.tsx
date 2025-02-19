import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { recordTablePendingRecordIdComponentState } from '@/object-record/record-table/states/recordTablePendingRecordIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTablePendingRow = () => {
  const pendingRecordId = useRecoilComponentValueV2(
    recordTablePendingRecordIdComponentState,
  );

  if (!pendingRecordId) return <></>;

  return (
    <RecordTableRow
      key={pendingRecordId}
      recordId={pendingRecordId}
      rowIndexForDrag={-1}
      rowIndexForFocus={-1}
      isPendingRow
    />
  );
};
