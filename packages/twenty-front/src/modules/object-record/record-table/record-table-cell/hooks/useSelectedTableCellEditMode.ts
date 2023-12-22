import { useCallback } from 'react';

import { useMoveEditModeToTableCellPosition } from '../../hooks/internal/useMoveEditModeToCellPosition';

export const useSelectedTableCellEditMode = () => {
  const moveEditModeToTableCellPosition = useMoveEditModeToTableCellPosition();

  const setSelectedTableCellEditMode = useCallback(
    (row: number, column: number) => {
      moveEditModeToTableCellPosition({ column, row });
    },
    [moveEditModeToTableCellPosition],
  );

  return { setSelectedTableCellEditMode };
};
