import { useCallback } from 'react';

import { useMoveEditModeToTableCellPosition } from '../../hooks/internal/useMoveEditModeToCellPosition';

export const useSelectedTableCellEditMode = ({
  scopeId,
}: {
  scopeId: string;
}) => {
  const moveEditModeToTableCellPosition =
    useMoveEditModeToTableCellPosition(scopeId);

  const setSelectedTableCellEditMode = useCallback(
    (row: number, column: number) => {
      moveEditModeToTableCellPosition({ column, row });
    },
    [moveEditModeToTableCellPosition],
  );

  return { setSelectedTableCellEditMode };
};
