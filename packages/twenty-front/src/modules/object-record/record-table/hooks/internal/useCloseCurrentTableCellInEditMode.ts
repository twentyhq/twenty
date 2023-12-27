import { useRecoilCallback } from 'recoil';

import { currentTableCellInEditModePositionState } from '../../states/currentTableCellInEditModePositionState';
import { isTableCellInEditModeScopedFamilyState } from '../../states/isTableCellInEditModeScopedFamilyState';

export const useCloseCurrentTableCellInEditMode = () =>
  useRecoilCallback(({ set, snapshot }) => {
    return async () => {
      const currentTableCellInEditModePosition = snapshot
        .getLoadable(currentTableCellInEditModePositionState)
        .valueOrThrow();

      set(
        isTableCellInEditModeScopedFamilyState(
          currentTableCellInEditModePosition,
        ),
        false,
      );
    };
  }, []);
