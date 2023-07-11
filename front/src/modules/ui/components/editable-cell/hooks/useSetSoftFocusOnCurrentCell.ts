import { useMemo } from 'react';
import { useRecoilCallback } from 'recoil';

import { useSetHotkeysScope } from '@/hotkeys/hooks/useSetHotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useSetSoftFocusPosition } from '@/ui/tables/hooks/useSetSoftFocusPosition';
import { CellContext } from '@/ui/tables/states/CellContext';
import { currentColumnNumberScopedState } from '@/ui/tables/states/currentColumnNumberScopedState';
import { currentRowNumberScopedState } from '@/ui/tables/states/currentRowNumberScopedState';
import { isSoftFocusActiveState } from '@/ui/tables/states/isSoftFocusActiveState';
import { RowContext } from '@/ui/tables/states/RowContext';
import { CellPosition } from '@/ui/tables/types/CellPosition';

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

  const currentTablePosition: CellPosition = useMemo(
    () => ({
      column: currentColumnNumber,
      row: currentRowNumber,
    }),
    [currentColumnNumber, currentRowNumber],
  );

  const setHotkeysScope = useSetHotkeysScope();

  return useRecoilCallback(
    ({ set }) =>
      () => {
        setSoftFocusPosition(currentTablePosition);

        set(isSoftFocusActiveState, true);

        setHotkeysScope(InternalHotkeysScope.TableSoftFocus);
      },
    [setHotkeysScope, currentTablePosition, setSoftFocusPosition],
  );
}
