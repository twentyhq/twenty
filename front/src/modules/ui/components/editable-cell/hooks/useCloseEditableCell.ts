import { useRecoilCallback } from 'recoil';

import { useRemoveHighestHotkeysScopeStackItem } from '@/hotkeys/hooks/useRemoveHighestHotkeysScopeStackItem';
import { useCloseCurrentCellInEditMode } from '@/ui/tables/hooks/useClearCellInEditMode';
import { isSoftFocusActiveState } from '@/ui/tables/states/isSoftFocusActiveState';
import { isSomeInputInEditModeState } from '@/ui/tables/states/isSomeInputInEditModeState';

import { useCurrentCellEditMode } from './useCurrentCellEditMode';

export function useEditableCell() {
  const { setCurrentCellInEditMode } = useCurrentCellEditMode();

  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  const removeHighestHotkeysScopedStackItem =
    useRemoveHighestHotkeysScopeStackItem();

  function closeEditableCell() {
    closeCurrentCellInEditMode();
    removeHighestHotkeysScopedStackItem();
  }

  const openEditableCell = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const isSomeInputInEditMode = snapshot
          .getLoadable(isSomeInputInEditModeState)
          .valueOrThrow();

        if (!isSomeInputInEditMode) {
          set(isSomeInputInEditModeState, true);
          set(isSoftFocusActiveState, false);

          setCurrentCellInEditMode();
        }
      },
    [setCurrentCellInEditMode],
  );

  return {
    closeEditableCell,
    openEditableCell,
  };
}
