import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { useMoveEditModeToCellPosition } from '@/ui/tables/hooks/useMoveEditModeToCellPosition';
import { isCellInEditModeFamilyState } from '@/ui/tables/states/isCellInEditModeFamilyState';

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
