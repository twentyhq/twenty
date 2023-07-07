import { useRecoilCallback } from 'recoil';

import { useRemoveAppFocus } from '@/app-focus/hooks/useRemoveAppFocus';
import { useSwitchToAppFocus } from '@/app-focus/hooks/useSwitchToAppFocus';
import { useClearCellInEditMode } from '@/ui/tables/hooks/useClearCellInEditMode';
import { isSomeInputInEditModeState } from '@/ui/tables/states/isSomeInputInEditModeState';

import { useCurrentCellEditMode } from './useCurrentCellEditMode';

export function useEditableCell() {
  const { setCurrentCellInEditMode } = useCurrentCellEditMode();

  const clearCellInEditMode = useClearCellInEditMode();

  const removeAppFocus = useRemoveAppFocus();
  const switchToAppFocus = useSwitchToAppFocus();

  const closeEditableCell = useRecoilCallback(
    ({ set }) =>
      async () => {
        clearCellInEditMode();

        // TODO: find a better way
        await new Promise((resolve) => setTimeout(resolve, 20));

        removeAppFocus('table-cell');

        await new Promise((resolve) => setTimeout(resolve, 20));

        set(isSomeInputInEditModeState, false);
      },
    [clearCellInEditMode, removeAppFocus, clearCellInEditMode],
  );

  const openEditableCell = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const isSomeInputInEditMode = snapshot
          .getLoadable(isSomeInputInEditModeState)
          .valueOrThrow();

        switchToAppFocus('table-cell');

        if (!isSomeInputInEditMode) {
          set(isSomeInputInEditModeState, true);

          setCurrentCellInEditMode();
        }
      },
    [setCurrentCellInEditMode, switchToAppFocus],
  );

  return {
    closeEditableCell,
    openEditableCell,
  };
}
