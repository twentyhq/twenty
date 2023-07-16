import { useRecoilCallback } from 'recoil';

import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';

import { useCloseCurrentCellInEditMode } from '../../hooks/useClearCellInEditMode';
import { isSomeInputInEditModeState } from '../../states/isSomeInputInEditModeState';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentCellEditMode } from './useCurrentCellEditMode';

export function useEditableCell() {
  const { setCurrentCellInEditMode } = useCurrentCellEditMode();

  const setHotkeyScope = useSetHotkeyScope();

  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  function closeEditableCell() {
    closeCurrentCellInEditMode();
    setHotkeyScope(TableHotkeyScope.TableSoftFocus);
  }

  const openEditableCell = useRecoilCallback(
    ({ snapshot, set }) =>
      (HotkeyScope: HotkeyScope) => {
        const isSomeInputInEditMode = snapshot
          .getLoadable(isSomeInputInEditModeState)
          .valueOrThrow();

        if (!isSomeInputInEditMode) {
          set(isSomeInputInEditModeState, true);

          setCurrentCellInEditMode();

          setHotkeyScope(HotkeyScope.scope);
        }
      },
    [setCurrentCellInEditMode, setHotkeyScope],
  );

  return {
    closeEditableCell,
    openEditableCell,
  };
}
