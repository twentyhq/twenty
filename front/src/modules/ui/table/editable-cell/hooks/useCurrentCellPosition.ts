import { useContext, useMemo } from 'react';

import { ColumnIndexContext } from '../../contexts/ColumnIndexContext';
import { RowIndexContext } from '../../contexts/RowIndexContext';
import { CellPosition } from '../../types/CellPosition';

export const useCurrentCellPosition = () => {
  const currentRowNumber = useContext(RowIndexContext);
  const currentColumnNumber = useContext(ColumnIndexContext);

  const currentCellPosition: CellPosition = useMemo(
    () => ({
      column: currentColumnNumber,
      row: currentRowNumber,
    }),
    [currentColumnNumber, currentRowNumber],
  );

  return currentCellPosition;
};
