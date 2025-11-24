import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowMultiDragCounterChip } from '@/object-record/record-table/record-table-row/components/RecordTableRowMultiDragCounterChip';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';

export const RecordTableRowMultiDragPreview = () => {
  const { recordId } = useRecordTableRowContextOrThrow();

  const isRecordIdPrimaryDragMultiple = useRecoilComponentFamilyValue(
    isRecordIdPrimaryDragMultipleComponentFamilyState,
    { recordId },
  );

  if (!isRecordIdPrimaryDragMultiple) {
    return null;
  }

  return <RecordTableRowMultiDragCounterChip />;
};
