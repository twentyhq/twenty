import { useRecoilCallback } from 'recoil';

import { currentTableCellInEditModePositionState } from '../../states/currentTableCellInEditModePositionState';
import { isTableCellInEditModeScopedFamilyState } from '../../states/isTableCellInEditModeScopedFamilyState';
import { TableCellPosition } from '../../types/TableCellPosition';

export const useMoveEditModeToTableCellPosition = () =>
  useRecoilCallback(({ set, snapshot }) => {
    return (newPosition: TableCellPosition) => {
      const currentTableCellInEditModePosition = snapshot
        .getLoadable(currentTableCellInEditModePositionState)
        .valueOrThrow();

      set(
        isTableCellInEditModeScopedFamilyState(
          currentTableCellInEditModePosition,
        ),
        false,
      );

      set(currentTableCellInEditModePositionState, newPosition);

      set(isTableCellInEditModeScopedFamilyState(newPosition), true);
    };
  }, []);
