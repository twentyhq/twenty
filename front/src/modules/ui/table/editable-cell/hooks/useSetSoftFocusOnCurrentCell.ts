import { useRecoilCallback } from 'recoil';

import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';

import { useSetSoftFocusPosition } from '../../hooks/useSetSoftFocusPosition';
import { isSoftFocusActiveState } from '../../states/isSoftFocusActiveState';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentCellPosition } from './useCurrentCellPosition';

export function useSetSoftFocusOnCurrentCell() {
  const setSoftFocusPosition = useSetSoftFocusPosition();

  const currentCellPosition = useCurrentCellPosition();

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
