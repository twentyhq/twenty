import { useRecoilCallback } from 'recoil';

import { currentTableCellInEditModePositionState } from '../../states/currentTableCellInEditModePositionState';
import { isTableCellInEditModeFamilyState } from '../../states/isTableCellInEditModeFamilyState';

export const useCloseCurrentTableCellInEditMode = () =>
  useRecoilCallback(({ set, snapshot }) => {
    return async () => {
      const currentTableCellInEditModePosition = snapshot
        .getLoadable(currentTableCellInEditModePositionState)
        .valueOrThrow();

      set(
        isTableCellInEditModeFamilyState(currentTableCellInEditModePosition),
        false,
      );
    };
  }, []);
