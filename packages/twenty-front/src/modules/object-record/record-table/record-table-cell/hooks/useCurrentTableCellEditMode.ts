import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

import { useMoveEditModeToTableCellPosition } from '../../hooks/internal/useMoveEditModeToCellPosition';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useCurrentTableCellEditMode = () => {
  const moveEditModeToTableCellPosition = useMoveEditModeToTableCellPosition();

  const currentTableCellPosition = useCurrentTableCellPosition();

  const { isTableCellInEditModeFamilyState } = useRecordTableStates();

  const isCurrentTableCellInEditMode = useRecoilValue(
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
