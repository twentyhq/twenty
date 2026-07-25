import { RecordDragMultiDragCounterChip } from '@/object-record/record-drag/components/RecordDragMultiDragCounterChip';
import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';

export const RecordTableRowMultiDragPreview = () => {
  const { recordId } = useRecordTableRowContextOrThrow();

  const isRecordIdPrimaryDragMultiple = useAtomComponentFamilyStateValue(
    isRecordIdPrimaryDragMultipleComponentFamilyState,
    { recordId },
  );

  if (!isRecordIdPrimaryDragMultiple) {
    return null;
  }

  return <RecordDragMultiDragCounterChip side="left" />;
};
