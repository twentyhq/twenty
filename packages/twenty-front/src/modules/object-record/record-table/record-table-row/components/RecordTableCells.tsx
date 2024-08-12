import { useContext } from 'react';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellsEmpty } from '@/object-record/record-table/record-table-row/components/RecordTableCellsEmpty';
import { RecordTableCellsVisible } from '@/object-record/record-table/record-table-row/components/RecordTableCellsVisible';

export const RecordTableCells = () => {
  const { inView, isDragging } = useContext(RecordTableRowContext);

  const areCellsVisible = inView || isDragging;

  return areCellsVisible ? (
    <RecordTableCellsVisible />
  ) : (
    <RecordTableCellsEmpty />
  );
};
