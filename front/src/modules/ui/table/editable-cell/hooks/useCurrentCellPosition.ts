import { useMemo } from 'react';

import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';

import { CellContext } from '../../states/CellContext';
import { currentColumnNumberScopedState } from '../../states/currentColumnNumberScopedState';
import { currentRowNumberScopedState } from '../../states/currentRowNumberScopedState';
import { RowContext } from '../../states/RowContext';
import { CellPosition } from '../../types/CellPosition';

export function useCurrentCellPosition() {
  const [currentRowNumber] = useRecoilScopedState(
    currentRowNumberScopedState,
    RowContext,
  );

  const [currentColumnNumber] = useRecoilScopedState(
    currentColumnNumberScopedState,
    CellContext,
  );

  const currentCellPosition: CellPosition = useMemo(
    () => ({
      column: currentColumnNumber,
      row: currentRowNumber,
    }),
    [currentColumnNumber, currentRowNumber],
  );

  return currentCellPosition;
}
