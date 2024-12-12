import { useContext } from 'react';

import { RecordTableRowDraggableContext } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCellsEmpty } from '@/object-record/record-table/record-table-row/components/RecordTableCellsEmpty';
import { RecordTableCellsVisible } from '@/object-record/record-table/record-table-row/components/RecordTableCellsVisible';

export const RecordTableCells = () => {
  const { inView } = useContext(RecordTableRowDraggableContext);

  const { isDragging } = useContext(RecordTableRowDraggableContext);

  const areCellsVisible = inView || isDragging;

  return areCellsVisible ? (
    <RecordTableCellsVisible />
  ) : (
    <RecordTableCellsEmpty />
  );
};
