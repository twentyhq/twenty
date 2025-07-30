import { useRecoilCallback } from 'recoil';

import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { isSomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/isSomeCellInEditModeComponentSelector';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const useMoveHoverToCurrentCell = (recordTableId: string) => {
  const setHoverPosition = useSetRecoilComponentStateV2(
    recordTableHoverPositionComponentState,
    recordTableId,
  );

  const isSomeCellInEditModeSelector = useRecoilComponentCallbackStateV2(
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
