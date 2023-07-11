import { useRecoilCallback } from 'recoil';

import { useSetHotkeysScope } from '@/hotkeys/hooks/useSetHotkeysScope';
import { HotkeysScope } from '@/hotkeys/types/internal/HotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { useCloseCurrentCellInEditMode } from '@/ui/tables/hooks/useClearCellInEditMode';
import { isSoftFocusActiveState } from '@/ui/tables/states/isSoftFocusActiveState';
import { isSomeInputInEditModeState } from '@/ui/tables/states/isSomeInputInEditModeState';

import { useCurrentCellEditMode } from './useCurrentCellEditMode';

export function useEditableCell() {
  const { setCurrentCellInEditMode } = useCurrentCellEditMode();

  const setHotkeysScope = useSetHotkeysScope();

  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  function closeEditableCell() {
    closeCurrentCellInEditMode();
    setHotkeysScope(InternalHotkeysScope.TableSoftFocus);
  }

  const openEditableCell = useRecoilCallback(
    ({ snapshot, set }) =>
      (hotkeysScope: HotkeysScope) => {
        const isSomeInputInEditMode = snapshot
          .getLoadable(isSomeInputInEditModeState)
          .valueOrThrow();

        if (!isSomeInputInEditMode) {
          set(isSomeInputInEditModeState, true);
          set(isSoftFocusActiveState, false);

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
