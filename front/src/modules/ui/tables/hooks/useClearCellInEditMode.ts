import { useRecoilCallback } from 'recoil';

import { currentCellInEditModePositionState } from '../states/currentCellInEditModePositionState';
import { isCellInEditModeFamilyState } from '../states/isCellInEditModeFamilyState';

export function useClearCellInEditMode() {
  return useRecoilCallback(({ set, snapshot }) => {
    return () => {
      const currentCellInEditModePosition = snapshot
        .getLoadable(currentCellInEditModePositionState)
        .valueOrThrow();

      set(isCellInEditModeFamilyState(currentCellInEditModePosition), false);
    };
  }, []);
}
