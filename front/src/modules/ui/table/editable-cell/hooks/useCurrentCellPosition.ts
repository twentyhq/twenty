import { useContext, useMemo } from 'react';

import { ColumnIndexContext } from '../../states/ColumnIndexContext';
import { RowIndexContext } from '../../states/RowIndexContext';
import { CellPosition } from '../../types/CellPosition';

export function useCurrentCellPosition() {
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
}
