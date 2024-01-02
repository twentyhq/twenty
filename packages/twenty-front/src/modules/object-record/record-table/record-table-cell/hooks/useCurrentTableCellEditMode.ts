import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

import { useMoveEditModeToTableCellPosition } from '../../hooks/internal/useMoveEditModeToCellPosition';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useCurrentTableCellEditMode = () => {
  const { scopeId } = useRecordTable();

  const moveEditModeToTableCellPosition =
    useMoveEditModeToTableCellPosition(scopeId);

  const currentTableCellPosition = useCurrentTableCellPosition();

  const { isTableCellInEditModeScopeInjector } = getRecordTableScopeInjector();

  const { injectFamilyStateWithRecordTableScopeId } =
    useRecordTableScopedStates();

  const isTableCellInEditModeFamilyState =
    injectFamilyStateWithRecordTableScopeId(isTableCellInEditModeScopeInjector);

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
