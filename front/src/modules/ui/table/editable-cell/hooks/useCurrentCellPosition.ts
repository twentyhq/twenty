import { useContext, useMemo } from 'react';

import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';

import { CellContext } from '../../states/CellContext';
import { ColumnIndexContext } from '../../states/ColumnIndexContext';
import { currentColumnNumberScopedState } from '../../states/currentColumnNumberScopedState';
import { currentRowNumberScopedState } from '../../states/currentRowNumberScopedState';
import { RowContext } from '../../states/RowContext';
import { RowIndexContext } from '../../states/RowIndexContext';
import { CellPosition } from '../../types/CellPosition';

export function useCurrentCellPosition() {
  const currentRowNumber = useContext(RowIndexContext);

  // const [currentRowNumber] = useRecoilScopedState(
  //   currentRowNumberScopedState,
  //   RowContext,
  // );

  const currentColumnNumber = useContext(ColumnIndexContext);

  // const [currentColumnNumber] = useRecoilScopedState(
  //   currentColumnNumberScopedState,
  //   CellContext,
  // );

  const currentCellPosition: CellPosition = useMemo(
    () => ({
      column: currentColumnNumber,
      row: currentRowNumber,
    }),
    [currentColumnNumber, currentRowNumber],
  );

  return currentCellPosition;
}
