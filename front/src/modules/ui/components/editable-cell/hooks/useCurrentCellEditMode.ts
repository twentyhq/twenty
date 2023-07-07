import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { useSetCellInEditMode } from '@/ui/tables/hooks/useSetCellInEditMode';
import { isCellInEditModeFamilyState } from '@/ui/tables/states/isCellInEditModeFamilyState';

import { useCurrentCellPosition } from './useCurrentCellPosition';

export function useCurrentCellEditMode() {
  const setCellInEditMode = useSetCellInEditMode();

  const currentCellPosition = useCurrentCellPosition();

  const [isCurrentCellInEditMode] = useRecoilState(
    isCellInEditModeFamilyState(currentCellPosition),
  );

  const setCurrentCellInEditMode = useCallback(() => {
    setCellInEditMode(currentCellPosition);
  }, [currentCellPosition, setCellInEditMode]);

  return { isCurrentCellInEditMode, setCurrentCellInEditMode };
}
