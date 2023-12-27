import { useRecoilCallback } from 'recoil';

import { currentTableCellInEditModePositionState } from '../../states/currentTableCellInEditModePositionState';
import { isTableCellInEditModeScopedFamilyState } from '../../states/isTableCellInEditModeScopedFamilyState';

export const useGetIsSomeCellInEditMode = () => {
  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentTableCellInEditModePosition = snapshot
          .getLoadable(currentTableCellInEditModePositionState)
          .valueOrThrow();

        const isSomeCellInEditMode = snapshot
          .getLoadable(
            isTableCellInEditModeScopedFamilyState(
              currentTableCellInEditModePosition,
            ),
          )
          .valueOrThrow();

        return isSomeCellInEditMode;
      },
    [],
  );
};
