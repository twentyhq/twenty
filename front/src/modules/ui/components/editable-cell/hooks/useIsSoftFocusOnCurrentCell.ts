import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { CellContext } from '@/ui/tables/states/CellContext';
import { currentColumnNumberScopedState } from '@/ui/tables/states/currentColumnNumberScopedState';
import { currentRowNumberScopedState } from '@/ui/tables/states/currentRowNumberScopedState';
import { isSoftFocusOnCellFamilyState } from '@/ui/tables/states/isSoftFocusOnCellFamilyState';
import { RowContext } from '@/ui/tables/states/RowContext';
import { TablePosition } from '@/ui/tables/types/TablePosition';

export function useIsSoftFocusOnCurrentCell() {
  const [currentRowNumber] = useRecoilScopedState(
    currentRowNumberScopedState,
    RowContext,
  );

  const [currentColumnNumber] = useRecoilScopedState(
    currentColumnNumberScopedState,
    CellContext,
  );

  const currentTablePosition: TablePosition = useMemo(
    () => ({
      column: currentColumnNumber,
      row: currentRowNumber,
    }),
    [currentColumnNumber, currentRowNumber],
  );

  const isSoftFocusOnCell = useRecoilValue(
    isSoftFocusOnCellFamilyState(currentTablePosition),
  );

  return isSoftFocusOnCell;
}
