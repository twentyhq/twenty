import { useCallback, useMemo } from 'react';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useSetSoftFocusPosition } from '@/ui/tables/hooks/useSetSoftFocusPosition';
import { CellContext } from '@/ui/tables/states/CellContext';
import { currentColumnNumberScopedState } from '@/ui/tables/states/currentColumnNumberScopedState';
import { currentRowNumberScopedState } from '@/ui/tables/states/currentRowNumberScopedState';
import { RowContext } from '@/ui/tables/states/RowContext';
import { TablePosition } from '@/ui/tables/types/TablePosition';

export function useSetSoftFocusOnCurrentCell() {
  const setSoftFocusPosition = useSetSoftFocusPosition();
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

  return useCallback(() => {
    setSoftFocusPosition(currentTablePosition);
  }, [setSoftFocusPosition, currentTablePosition]);
}
