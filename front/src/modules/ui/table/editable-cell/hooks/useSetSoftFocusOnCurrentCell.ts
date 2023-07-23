import { useMemo } from 'react';
import { useRecoilCallback } from 'recoil';

import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';

import { useSetSoftFocusPosition } from '../../hooks/useSetSoftFocusPosition';
import { CellContext } from '../../states/CellContext';
import { currentColumnNumberScopedState } from '../../states/currentColumnNumberScopedState';
import { currentRowNumberScopedState } from '../../states/currentRowNumberScopedState';
import { isSoftFocusActiveState } from '../../states/isSoftFocusActiveState';
import { RowContext } from '../../states/RowContext';
import { CellPosition } from '../../types/CellPosition';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentCellPosition } from './useCurrentCellPosition';

export function useSetSoftFocusOnCurrentCell() {
  const setSoftFocusPosition = useSetSoftFocusPosition();

  const currentCellPosition = useCurrentCellPosition();

  // const [currentRowNumber] = useRecoilScopedState(
  //   currentRowNumberScopedState,
  //   RowContext,
  // );

  // const [currentColumnNumber] = useRecoilScopedState(
  //   currentColumnNumberScopedState,
  //   CellContext,
  // );

  // const currentTablePosition: CellPosition = useMemo(
  //   () => ({
  //     column: currentColumnNumber,
  //     row: currentRowNumber,
  //   }),
  //   [currentColumnNumber, currentRowNumber],
  // );

  const setHotkeyScope = useSetHotkeyScope();

  return useRecoilCallback(
    ({ set }) =>
      () => {
        setSoftFocusPosition(currentCellPosition);

        set(isSoftFocusActiveState, true);

        setHotkeyScope(TableHotkeyScope.TableSoftFocus);
      },
    [setHotkeyScope, currentCellPosition, setSoftFocusPosition],
  );
}
