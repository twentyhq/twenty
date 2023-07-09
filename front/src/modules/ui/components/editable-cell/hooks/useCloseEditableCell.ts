import { useRecoilCallback } from 'recoil';

import { useAddToHotkeysScopeStack } from '@/hotkeys/hooks/useAddToHotkeysScopeStack';
import { useRemoveHighestHotkeysScopeStackItem } from '@/hotkeys/hooks/useRemoveHighestHotkeysScopeStackItem';
import { HotkeysScopeStackItem } from '@/hotkeys/types/internal/HotkeysScopeStackItems';
import { useCloseCurrentCellInEditMode } from '@/ui/tables/hooks/useClearCellInEditMode';
import { isSoftFocusActiveState } from '@/ui/tables/states/isSoftFocusActiveState';
import { isSomeInputInEditModeState } from '@/ui/tables/states/isSomeInputInEditModeState';

import { useCurrentCellEditMode } from './useCurrentCellEditMode';

export function useEditableCell() {
  const { setCurrentCellInEditMode } = useCurrentCellEditMode();

  const addToHotkeysScopeStack = useAddToHotkeysScopeStack();

  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  const removeHighestHotkeysScopedStackItem =
    useRemoveHighestHotkeysScopeStackItem();

  function closeEditableCell() {
    closeCurrentCellInEditMode();
    removeHighestHotkeysScopedStackItem();
  }

  const openEditableCell = useRecoilCallback(
    ({ snapshot, set }) =>
      (hotkeysScopeStackItem: HotkeysScopeStackItem) => {
        const isSomeInputInEditMode = snapshot
          .getLoadable(isSomeInputInEditModeState)
          .valueOrThrow();

        if (!isSomeInputInEditMode) {
          set(isSomeInputInEditModeState, true);
          set(isSoftFocusActiveState, false);

          setCurrentCellInEditMode();

          addToHotkeysScopeStack(hotkeysScopeStackItem);
        }
      },
    [setCurrentCellInEditMode, addToHotkeysScopeStack],
  );

  return {
    closeEditableCell,
    openEditableCell,
  };
}
