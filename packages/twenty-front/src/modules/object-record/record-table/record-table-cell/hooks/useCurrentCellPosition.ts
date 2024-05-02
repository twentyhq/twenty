import { useContext } from 'react';

import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export const useCurrentTableCellPosition = () => {
  const { rowIndex } = useContext(RecordTableRowContext);
  const { columnIndex } = useContext(RecordTableCellContext);

  return {
    column: columnIndex,
    row: rowIndex,
  } as TableCellPosition;
};
