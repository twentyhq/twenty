import { useContext, useMemo } from 'react';

import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';

import { TableCellPosition } from '../../types/TableCellPosition';

export const useCurrentTableCellPosition = () => {
  const { rowIndex } = useContext(RecordTableRowContext);
  const { columnIndex } = useContext(RecordTableCellContext);

  const currentTableCellPosition: TableCellPosition = useMemo(
    () => ({
      column: columnIndex,
      row: rowIndex,
    }),
    [columnIndex, rowIndex],
  );

  return currentTableCellPosition;
};
