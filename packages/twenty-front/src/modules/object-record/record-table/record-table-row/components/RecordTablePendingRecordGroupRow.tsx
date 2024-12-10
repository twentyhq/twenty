import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { recordTablePendingRecordIdByGroupComponentFamilyState } from '@/object-record/record-table/states/recordTablePendingRecordIdByGroupComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';

export const RecordTablePendingRecordGroupRow = () => {
  const currentRecordGroupId = useCurrentRecordGroupId();

  const pendingRecordId = useRecoilComponentFamilyValueV2(
    recordTablePendingRecordIdByGroupComponentFamilyState,
    currentRecordGroupId,
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
