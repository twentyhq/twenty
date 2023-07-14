import { useRecoilCallback } from 'recoil';

import { useSetHotkeyScope } from '@/lib/hotkeys/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/lib/hotkeys/types/HotkeyScope';
import { useCloseCurrentCellInEditMode } from '@/ui/tables/hooks/useClearCellInEditMode';
import { isSomeInputInEditModeState } from '@/ui/tables/states/isSomeInputInEditModeState';
import { TableHotkeyScope } from '@/ui/tables/types/TableHotkeyScope';

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
