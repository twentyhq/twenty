import { useContext, useMemo } from 'react';

import { ColumnIndexContext } from '../../contexts/ColumnIndexContext';
import { RowIndexContext } from '../../contexts/RowIndexContext';
import { TableCellPosition } from '../../types/TableCellPosition';

export const useCurrentTableCellPosition = () => {
  const currentRowNumber = useContext(RowIndexContext);
  const currentColumnNumber = useContext(ColumnIndexContext);

  const currentTableCellPosition: TableCellPosition = useMemo(
    () => ({
      column: currentColumnNumber,
      row: currentRowNumber,
    }),
    [currentColumnNumber, currentRowNumber],
  );

  return currentTableCellPosition;
};
