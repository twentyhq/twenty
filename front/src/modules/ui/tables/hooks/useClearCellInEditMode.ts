import { useRecoilCallback } from 'recoil';

import { currentCellInEditModePositionState } from '../states/currentCellInEditModePositionState';
import { isCellInEditModeFamilyState } from '../states/isCellInEditModeFamilyState';
import { isSomeInputInEditModeState } from '../states/isSomeInputInEditModeState';

export function useCloseCurrentCellInEditMode() {
  return useRecoilCallback(({ set, snapshot }) => {
    return async () => {
      const currentCellInEditModePosition = await snapshot.getPromise(
        currentCellInEditModePositionState,
      );

      set(isCellInEditModeFamilyState(currentCellInEditModePosition), false);

      await new Promise((resolve) => setTimeout(resolve, 20));

      set(isSomeInputInEditModeState, false);
    };
  }, []);
}
