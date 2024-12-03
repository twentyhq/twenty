import { useCallback } from 'react';

import { useMoveEditModeToTableCellPosition } from '../../hooks/internal/useMoveEditModeToCellPosition';

import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useCurrentTableCellEditMode = () => {
  const moveEditModeToTableCellPosition = useMoveEditModeToTableCellPosition();

  const currentTableCellPosition = useCurrentTableCellPosition();

  const isCurrentTableCellInEditMode = useRecoilComponentFamilyValueV2(
    isTableCellInEditModeComponentFamilyState,
    currentTableCellPosition,
  );

  const setCurrentTableCellInEditMode = useCallback(() => {
    moveEditModeToTableCellPosition(currentTableCellPosition);
  }, [currentTableCellPosition, moveEditModeToTableCellPosition]);

  return {
    isCurrentTableCellInEditMode,
    setCurrentTableCellInEditMode,
  };
};
