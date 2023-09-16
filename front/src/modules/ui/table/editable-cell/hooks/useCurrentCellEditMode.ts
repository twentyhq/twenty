import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { useMoveEditModeToCellPosition } from '../../hooks/useMoveEditModeToCellPosition';
import { isCellInEditModeFamilyState } from '../../states/isCellInEditModeFamilyState';

import { useCurrentCellPosition } from './useCurrentCellPosition';

export const useCurrentCellEditMode = () => {
  const moveEditModeToCellPosition = useMoveEditModeToCellPosition();

  const currentCellPosition = useCurrentCellPosition();

  const [isCurrentCellInEditMode] = useRecoilState(
    isCellInEditModeFamilyState(currentCellPosition),
  );

  const setCurrentCellInEditMode = useCallback(() => {
    moveEditModeToCellPosition(currentCellPosition);
  }, [currentCellPosition, moveEditModeToCellPosition]);

  return { isCurrentCellInEditMode, setCurrentCellInEditMode };
};
