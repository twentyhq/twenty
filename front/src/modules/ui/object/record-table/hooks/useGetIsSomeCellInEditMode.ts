import { useRecoilCallback } from 'recoil';

import { currentTableCellInEditModePositionState } from '../states/currentTableCellInEditModePositionState';
import { isTableCellInEditModeFamilyState } from '../states/isTableCellInEditModeFamilyState';

export const useGetIsSomeCellInEditMode = () => {
  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentTableCellInEditModePosition = snapshot
          .getLoadable(currentTableCellInEditModePositionState)
          .valueOrThrow();

        const isSomeCellInEditMode = snapshot
          .getLoadable(
            isTableCellInEditModeFamilyState(
              currentTableCellInEditModePosition,
            ),
          )
          .valueOrThrow();

        return isSomeCellInEditMode;
      },
    [],
  );
};
