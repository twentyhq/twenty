import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { useMoveEditModeToTableCellPosition } from '../../hooks/internal/useMoveEditModeToCellPosition';
import { isTableCellInEditModeScopedFamilyState } from '../../states/isTableCellInEditModeScopedFamilyState';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useCurrentTableCellEditMode = () => {
  const moveEditModeToTableCellPosition = useMoveEditModeToTableCellPosition();

  const currentTableCellPosition = useCurrentTableCellPosition();

  const [isCurrentTableCellInEditMode] = useRecoilState(
    isTableCellInEditModeScopedFamilyState(currentTableCellPosition),
  );

  const setCurrentTableCellInEditMode = useCallback(() => {
    moveEditModeToTableCellPosition(currentTableCellPosition);
  }, [currentTableCellPosition, moveEditModeToTableCellPosition]);

  return {
    isCurrentTableCellInEditMode,
    setCurrentTableCellInEditMode,
  };
};
