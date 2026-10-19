import { RecordTableDraggableTr } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTr';
import { RecordTableRowCells } from '@/object-record/record-table/record-table-row/components/RecordTableRowCells';
import { RecordTableStaticTr } from '@/object-record/record-table/record-table-row/components/RecordTableStaticTr';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { RecordTableRowVirtualizedSkeleton } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedSkeleton';
import { lowDetailsActivatedComponentState } from '@/object-record/record-table/virtualization/states/lowDetailsActivatedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type RecordTableRowSlotRecordContentProps = {
  recordId: string;
};

export const RecordTableRowSlotRecordContent = ({
  recordId,
}: RecordTableRowSlotRecordContentProps) => {
  const lowDetailsActivated = useAtomComponentStateValue(
    lowDetailsActivatedComponentState,
  );

  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  if (lowDetailsActivated) {
    return <RecordTableRowVirtualizedSkeleton />;
  }

  if (isRecordTableDragColumnHidden) {
    return (
      <RecordTableStaticTr recordId={recordId}>
        <RecordTableRowCells />
      </RecordTableStaticTr>
    );
  }

  return (
    <RecordTableDraggableTr recordId={recordId}>
      <RecordTableRowCells />
    </RecordTableDraggableTr>
  );
};
