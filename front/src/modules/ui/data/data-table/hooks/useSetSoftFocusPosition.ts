import { useRecoilCallback } from 'recoil';

import { isSoftFocusActiveState } from '../states/isSoftFocusActiveState';
import { isSoftFocusOnTableCellFamilyState } from '../states/isSoftFocusOnTableCellFamilyState';
import { softFocusPositionState } from '../states/softFocusPositionState';
import { TableCellPosition } from '../types/TableCellPosition';

export const useSetSoftFocusPosition = () =>
  useRecoilCallback(({ set, snapshot }) => {
    return (newPosition: TableCellPosition) => {
      const currentPosition = snapshot
        .getLoadable(softFocusPositionState)
        .valueOrThrow();

      set(isSoftFocusActiveState, true);

      set(isSoftFocusOnTableCellFamilyState(currentPosition), false);

      set(softFocusPositionState, newPosition);

      set(isSoftFocusOnTableCellFamilyState(newPosition), true);
    };
  }, []);
