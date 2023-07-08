import { useRecoilCallback } from 'recoil';

import { currentCellInEditModePositionState } from '../states/currentCellInEditModePositionState';
import { isCellInEditModeFamilyState } from '../states/isCellInEditModeFamilyState';
import { CellPosition } from '../types/CellPosition';

export function useMoveEditModeToCellPosition() {
  return useRecoilCallback(({ set, snapshot }) => {
    return (newPosition: CellPosition) => {
      const currentCellInEditModePosition = snapshot
        .getLoadable(currentCellInEditModePositionState)
        .valueOrThrow();

      set(isCellInEditModeFamilyState(currentCellInEditModePosition), false);

      set(currentCellInEditModePositionState, newPosition);

      set(isCellInEditModeFamilyState(newPosition), true);
    };
  }, []);
}
