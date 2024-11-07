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
    (recordId: string, column: number) => {
      moveEditModeToTableCellPosition({ column, recordId });
    },
    [moveEditModeToTableCellPosition],
  );

  return { setSelectedTableCellEditMode };
};
