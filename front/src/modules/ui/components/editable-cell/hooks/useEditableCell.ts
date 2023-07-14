import { useRecoilCallback } from 'recoil';

import { useSetHotkeysScope } from '@/lib/hotkeys/hooks/useSetHotkeysScope';
import { HotkeysScope } from '@/lib/hotkeys/types/HotkeysScope';
import { useCloseCurrentCellInEditMode } from '@/ui/tables/hooks/useClearCellInEditMode';
import { isSomeInputInEditModeState } from '@/ui/tables/states/isSomeInputInEditModeState';
import { HotkeyScope } from '@/ui/tables/types/HotkeyScope';

import { useCurrentCellEditMode } from './useCurrentCellEditMode';

export function useEditableCell() {
  const { setCurrentCellInEditMode } = useCurrentCellEditMode();

  const setHotkeysScope = useSetHotkeysScope();

  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  function closeEditableCell() {
    closeCurrentCellInEditMode();
    setHotkeysScope(HotkeyScope.TableSoftFocus);
  }

  const openEditableCell = useRecoilCallback(
    ({ snapshot, set }) =>
      (hotkeysScope: HotkeysScope) => {
        const isSomeInputInEditMode = snapshot
          .getLoadable(isSomeInputInEditModeState)
          .valueOrThrow();

        if (!isSomeInputInEditMode) {
          set(isSomeInputInEditModeState, true);

          setCurrentCellInEditMode();

          setHotkeysScope(hotkeysScope.scope);
        }
      },
    [setCurrentCellInEditMode, setHotkeysScope],
  );

  return {
    closeEditableCell,
    openEditableCell,
  };
}
