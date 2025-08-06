import { useRecoilCallback } from 'recoil';

import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { isSomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/isSomeCellInEditModeComponentSelector';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

export const useMoveHoverToCurrentCell = (recordTableId: string) => {
  const setHoverPosition = useSetRecoilComponentState(
    recordTableHoverPositionComponentState,
    recordTableId,
  );

  const isSomeCellInEditModeSelector = useRecoilComponentCallbackState(
    isSomeCellInEditModeComponentSelector,
    recordTableId,
  );

  const moveHoverToCurrentCell = useRecoilCallback(
    ({ snapshot }) =>
      (cellPosition: TableCellPosition) => {
        const isSomeCellInEditMode = getSnapshotValue(
          snapshot,
          isSomeCellInEditModeSelector,
        );

        if (!isSomeCellInEditMode) {
          setHoverPosition(cellPosition);
        }
      },
    [isSomeCellInEditModeSelector, setHoverPosition],
  );

  return { moveHoverToCurrentCell };
};
