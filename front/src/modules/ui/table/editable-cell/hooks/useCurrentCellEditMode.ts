import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { useMoveEditModeToCellPosition } from '../../hooks/useMoveEditModeToCellPosition';
import { CellPosition } from '../../types/CellPosition';

import { useCurrentCellPosition } from './useCurrentCellPosition';

export function useCurrentCellEditMode() {
  const moveEditModeToCellPosition = useMoveEditModeToCellPosition();

  const currentCellPosition = useCurrentCellPosition();

  const [isCurrentCellInEditMode] = useRecoilState(
    isCellInEditModeFamilyState(currentCellPosition),
  );

  const setCurrentCellInEditMode = useCallback(() => {
    moveEditModeToCellPosition(currentCellPosition);
  }, [currentCellPosition, moveEditModeToCellPosition]);

  return { isCurrentCellInEditMode, setCurrentCellInEditMode };
}
function isCellInEditModeFamilyState(
  currentCellPosition: CellPosition,
): import('recoil').RecoilState<unknown> {
  throw new Error('Function not implemented.');
}
