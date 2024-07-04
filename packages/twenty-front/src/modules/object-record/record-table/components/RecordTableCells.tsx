import { useContext } from 'react';

import { RecordTableCellsEmpty } from '@/object-record/record-table/components/RecordTableCellsEmpty';
import { RecordTableCellsVisible } from '@/object-record/record-table/components/RecordTableCellsVisible';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';

export const RecordTableCells = () => {
  const { inView, isDragging } = useContext(RecordTableRowContext);

  const areCellsVisible = inView || isDragging;

  return areCellsVisible ? (
    <RecordTableCellsVisible />
  ) : (
    <RecordTableCellsEmpty />
  );
};
