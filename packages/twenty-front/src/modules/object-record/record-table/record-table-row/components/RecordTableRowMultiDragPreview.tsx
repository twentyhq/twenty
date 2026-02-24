import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowMultiDragCounterChip } from '@/object-record/record-table/record-table-row/components/RecordTableRowMultiDragCounterChip';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyValueV2';

export const RecordTableRowMultiDragPreview = () => {
  const { recordId } = useRecordTableRowContextOrThrow();

  const isRecordIdPrimaryDragMultiple = useRecoilComponentFamilyValueV2(
    isRecordIdPrimaryDragMultipleComponentFamilyState,
    { recordId },
  );

  if (!isRecordIdPrimaryDragMultiple) {
    return null;
  }

  return <RecordTableRowMultiDragCounterChip />;
};
