import { RecordDragMultiDragCounterChip } from '@/object-record/record-drag/components/RecordDragMultiDragCounterChip';
import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';

type RecordDragMultiDragPreviewProps = {
  recordId: string;
};

export const RecordDragMultiDragPreview = ({
  recordId,
}: RecordDragMultiDragPreviewProps) => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const isRecordIdPrimaryDragMultiple = useAtomComponentFamilyStateValue(
    isRecordIdPrimaryDragMultipleComponentFamilyState,
    { recordId },
    recordIndexId,
  );

  if (!isRecordIdPrimaryDragMultiple) {
    return null;
  }

  return (
    <RecordDragMultiDragCounterChip contextStoreInstanceId={recordIndexId} />
  );
};
