import { useRecoilCallback } from 'recoil';

import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { useSetSoftFocusPosition } from '../../hooks/useSetSoftFocusPosition';
import { isSoftFocusActiveState } from '../../states/isSoftFocusActiveState';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useSetSoftFocusOnCurrentTableCell = () => {
  const setSoftFocusPosition = useSetSoftFocusPosition();

  const currentTableCellPosition = useCurrentTableCellPosition();

  const setHotkeyScope = useSetHotkeyScope();

  return useRecoilCallback(
    ({ set }) =>
      () => {
        setSoftFocusPosition(currentTableCellPosition);

        set(isSoftFocusActiveState, true);

        setHotkeyScope(TableHotkeyScope.TableSoftFocus);
      },
    [setHotkeyScope, currentTableCellPosition, setSoftFocusPosition],
  );
};
