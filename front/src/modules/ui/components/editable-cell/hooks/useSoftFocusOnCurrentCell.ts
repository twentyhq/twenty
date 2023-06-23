import { useRecoilState } from 'recoil';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { CellContext } from '@/ui/tables/states/CellContext';
import { currentColumnNumberScopedState } from '@/ui/tables/states/currentColumnNumberScopedState';
import { currentRowNumberScopedState } from '@/ui/tables/states/currentRowNumberScopedState';
import { RowContext } from '@/ui/tables/states/RowContext';
import { softFocusPositionState } from '@/ui/tables/states/softFocusPositionState';

export function useSoftFocusOnCurrentCell() {
  const [currentRowNumber] = useRecoilScopedState(
    currentRowNumberScopedState,
    RowContext,
  );

  const [currentColumnNumber] = useRecoilScopedState(
    currentColumnNumberScopedState,
    CellContext,
  );

  const [softFocusPosition, setSoftFocusPosition] = useRecoilState(
    softFocusPositionState,
  );

  const isSelected =
    (currentColumnNumber === softFocusPosition?.column ?? 0) &&
    (currentRowNumber === softFocusPosition?.row ?? 0);

  function setSoftFocusOnCurrentCell() {
    setSoftFocusPosition({
      column: currentColumnNumber,
      row: currentRowNumber,
    });
  }

  return [isSelected, setSoftFocusOnCurrentCell] as const;
}
