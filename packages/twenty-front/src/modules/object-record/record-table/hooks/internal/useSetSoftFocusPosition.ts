import { useRecoilCallback } from 'recoil';

import { isSoftFocusActiveScopedState } from '../../states/isSoftFocusActiveScopedState';
import { isSoftFocusOnTableCellScopedFamilyState } from '../../states/isSoftFocusOnTableCellScopedFamilyState';
import { softFocusPositionScopedState } from '../../states/softFocusPositionScopedState';
import { TableCellPosition } from '../../types/TableCellPosition';

export const useSetSoftFocusPosition = () =>
  useRecoilCallback(({ set, snapshot }) => {
    return (newPosition: TableCellPosition) => {
      const currentPosition = snapshot
        .getLoadable(softFocusPositionScopedState)
        .valueOrThrow();

      set(isSoftFocusActiveScopedState, true);

      set(isSoftFocusOnTableCellScopedFamilyState(currentPosition), false);

      set(softFocusPositionScopedState, newPosition);

      set(isSoftFocusOnTableCellScopedFamilyState(newPosition), true);
    };
  }, []);
