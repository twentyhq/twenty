import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';

import { useCloseCurrentCellInEditMode } from '../../hooks/useClearCellInEditMode';
import { CellHotkeyScopeContext } from '../../states/CellHotkeyScopeContext';
import { isSomeInputInEditModeState } from '../../states/isSomeInputInEditModeState';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentCellEditMode } from './useCurrentCellEditMode';

const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export function useEditableCell() {
  const { setCurrentCellInEditMode } = useCurrentCellEditMode();

  const setHotkeyScope = useSetHotkeyScope();

  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  const customCellHotkeyScope = useContext(CellHotkeyScopeContext);

  function closeEditableCell() {
    closeCurrentCellInEditMode();
    setHotkeyScope(TableHotkeyScope.TableSoftFocus);
  }

  const openEditableCell = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const isSomeInputInEditMode = snapshot
          .getLoadable(isSomeInputInEditModeState)
          .valueOrThrow();

        if (!isSomeInputInEditMode) {
          set(isSomeInputInEditModeState, true);

          setCurrentCellInEditMode();

          if (customCellHotkeyScope) {
            setHotkeyScope(
              customCellHotkeyScope.scope,
              customCellHotkeyScope.customScopes,
            );
          } else {
            setHotkeyScope(
              DEFAULT_CELL_SCOPE.scope,
              DEFAULT_CELL_SCOPE.customScopes,
            );
          }
        }
      },
    [setCurrentCellInEditMode, setHotkeyScope, customCellHotkeyScope],
  );

  return {
    closeEditableCell,
    openEditableCell,
  };
}
