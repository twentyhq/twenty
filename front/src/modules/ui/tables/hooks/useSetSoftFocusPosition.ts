import { useRecoilCallback } from 'recoil';

import { isSoftFocusOnCellFamilyState } from '../states/isSoftFocusOnCellFamilyState';
import { softFocusPositionState } from '../states/softFocusPositionState';
import { TablePosition } from '../types/TablePosition';

export function useSetSoftFocusPosition() {
  return useRecoilCallback(({ set, snapshot }) => {
    return (newPosition: TablePosition) => {
      const currentPosition = snapshot
        .getLoadable(softFocusPositionState)
        .valueOrThrow();

      set(isSoftFocusOnCellFamilyState(currentPosition), false);

      set(softFocusPositionState, newPosition);

      set(isSoftFocusOnCellFamilyState(newPosition), true);
    };
  }, []);
}
