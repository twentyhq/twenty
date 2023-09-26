import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { useMoveEditModeToTableCellPosition } from '../../hooks/useMoveEditModeToCellPosition';
import { isTableCellInEditModeFamilyState } from '../../states/isTableCellInEditModeFamilyState';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useCurrentTableCellEditMode = () => {
  const moveEditModeToTableCellPosition = useMoveEditModeToTableCellPosition();

  const currentTableCellPosition = useCurrentTableCellPosition();

  const [isCurrentTableCellInEditMode] = useRecoilState(
    isTableCellInEditModeFamilyState(currentTableCellPosition),
  );

  const setCurrentTableCellInEditMode = useCallback(() => {
    moveEditModeToTableCellPosition(currentTableCellPosition);
  }, [currentTableCellPosition, moveEditModeToTableCellPosition]);

  return {
    isCurrentTableCellInEditMode,
    setCurrentTableCellInEditMode,
  };
};
