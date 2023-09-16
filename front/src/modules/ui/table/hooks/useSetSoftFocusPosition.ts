import { useRecoilCallback } from 'recoil';

import { isSoftFocusActiveState } from '../states/isSoftFocusActiveState';
import { isSoftFocusOnCellFamilyState } from '../states/isSoftFocusOnCellFamilyState';
import { softFocusPositionState } from '../states/softFocusPositionState';
import { CellPosition } from '../types/CellPosition';

export const useSetSoftFocusPosition = () =>
  useRecoilCallback(({ set, snapshot }) => {
    return (newPosition: CellPosition) => {
      const currentPosition = snapshot
        .getLoadable(softFocusPositionState)
        .valueOrThrow();

      set(isSoftFocusActiveState, true);

      set(isSoftFocusOnCellFamilyState(currentPosition), false);

      set(softFocusPositionState, newPosition);

      set(isSoftFocusOnCellFamilyState(newPosition), true);
    };
  }, []);
