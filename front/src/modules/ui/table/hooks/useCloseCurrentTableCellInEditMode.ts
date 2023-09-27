import { useRecoilCallback } from 'recoil';

import { currentTableCellInEditModePositionState } from '../states/currentTableCellInEditModePositionState';
import { isTableCellInEditModeFamilyState } from '../states/isTableCellInEditModeFamilyState';

export const useCloseCurrentTableCellInEditMode = () =>
  useRecoilCallback(({ set, snapshot }) => {
    return async () => {
      const currentTableCellInEditModePosition = await snapshot.getPromise(
        currentTableCellInEditModePositionState,
      );

      set(
        isTableCellInEditModeFamilyState(currentTableCellInEditModePosition),
        false,
      );
    };
  }, []);
