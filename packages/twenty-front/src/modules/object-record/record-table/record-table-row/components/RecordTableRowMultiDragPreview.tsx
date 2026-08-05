import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableRowMultiDragCounterChip } from '@/object-record/record-table/record-table-row/components/RecordTableRowMultiDragCounterChip';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';

type RecordTableRowMultiDragPreviewProps = {
  recordId: string;
};

export const RecordTableRowMultiDragPreview = ({
  recordId,
}: RecordTableRowMultiDragPreviewProps) => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const isRecordIdPrimaryDragMultiple = useAtomComponentFamilyStateValue(
    isRecordIdPrimaryDragMultipleComponentFamilyState,
    { recordId },
    recordIndexId,
  );

  if (!isRecordIdPrimaryDragMultiple) {
    return null;
  }

  return <RecordTableRowMultiDragCounterChip />;
};
