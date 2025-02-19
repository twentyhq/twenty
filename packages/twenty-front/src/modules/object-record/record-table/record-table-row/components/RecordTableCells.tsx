import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableRowDraggableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCellsEmpty } from '@/object-record/record-table/record-table-row/components/RecordTableCellsEmpty';
import { RecordTableCellsVisible } from '@/object-record/record-table/record-table-row/components/RecordTableCellsVisible';

export const RecordTableCells = () => {
  const { inView } = useRecordTableRowContextOrThrow();

  const { isDragging } = useRecordTableRowDraggableContextOrThrow();

  const areCellsVisible = inView || isDragging;

  return areCellsVisible ? (
    <RecordTableCellsVisible />
  ) : (
    <RecordTableCellsEmpty />
  );
};
