import { useRecoilCallback } from 'recoil';

import { currentTableCellInEditModePositionState } from '../states/currentTableCellInEditModePositionState';
import { isTableCellInEditModeFamilyState } from '../states/isTableCellInEditModeFamilyState';
import { useSetSoftFocusOnCurrentTableCell } from '../table-cell/hooks/useSetSoftFocusOnCurrentTableCell';

export const useMoveSoftFocusToCurrentCellOnHover = () => {
  const setSoftFocusOnCurrentTableCell = useSetSoftFocusOnCurrentTableCell();

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentTableCellInEditModePosition = snapshot
          .getLoadable(currentTableCellInEditModePositionState)
          .valueOrThrow();

        const isSomeCellInEditMode = snapshot.getLoadable(
          isTableCellInEditModeFamilyState(currentTableCellInEditModePosition),
        );

        if (!isSomeCellInEditMode.contents) {
          setSoftFocusOnCurrentTableCell();
        }
      },
    [setSoftFocusOnCurrentTableCell],
  );
};
