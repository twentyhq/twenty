import { useRecoilCallback } from 'recoil';

import { currentTableCellInEditModePositionState } from '../states/currentTableCellInEditModePositionState';
import { isTableCellInEditModeFamilyState } from '../states/isTableCellInEditModeFamilyState';
import { TableCellPosition } from '../types/TableCellPosition';

export const useMoveEditModeToTableCellPosition = () =>
  useRecoilCallback(({ set, snapshot }) => {
    return (newPosition: TableCellPosition) => {
      const currentTableCellInEditModePosition = snapshot
        .getLoadable(currentTableCellInEditModePositionState)
        .valueOrThrow();

      set(
        isTableCellInEditModeFamilyState(currentTableCellInEditModePosition),
        false,
      );

      set(currentTableCellInEditModePositionState, newPosition);

      set(isTableCellInEditModeFamilyState(newPosition), true);
    };
  }, []);
