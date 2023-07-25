import { useRecoilCallback } from 'recoil';

import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';

import { useContextScopeId } from '../../../recoil-scope/hooks/useContextScopeId';
import { getSnapshotScopedState } from '../../../recoil-scope/utils/getSnapshotScopedState';
import { useCloseCurrentCellInEditMode } from '../../hooks/useClearCellInEditMode';
import { CellContext } from '../../states/CellContext';
import { isSomeInputInEditModeState } from '../../states/isSomeInputInEditModeState';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { customCellHotkeyScopeScopedState } from '../states/customCellHotkeyScopeScopedState';

import { useCurrentCellEditMode } from './useCurrentCellEditMode';

const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export function useEditableCell() {
  const { setCurrentCellInEditMode } = useCurrentCellEditMode();

  const setHotkeyScope = useSetHotkeyScope();

  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  const cellContextId = useContextScopeId(CellContext);

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

        const customCellHotkeyScope = getSnapshotScopedState({
          snapshot,
          state: customCellHotkeyScopeScopedState,
          contextScopeId: cellContextId,
        });

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
    [setCurrentCellInEditMode, setHotkeyScope, cellContextId],
  );

  return {
    closeEditableCell,
    openEditableCell,
  };
}
