import { useRecoilCallback } from 'recoil';

import { useMoveHoverToCurrentCell } from '@/object-record/record-table/record-table-cell/hooks/useMoveHoverToCurrentCell';
import { isSomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/isSomeCellInEditModeComponentSelector';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export type HandleContainerMouseEnterArgs = {
  cellPosition: TableCellPosition;
};

export const useHandleContainerMouseEnter = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const { moveHoverToCurrentCell } = useMoveHoverToCurrentCell(recordTableId);

  const isSomeCellInEditModeSelector = useRecoilComponentCallbackState(
    isSomeCellInEditModeComponentSelector,
    recordTableId,
  );

  const handleContainerMouseEnter = useRecoilCallback(
    ({ snapshot }) =>
      ({ cellPosition }: HandleContainerMouseEnterArgs) => {
        const isSomeCellInEditMode = getSnapshotValue(
          snapshot,
          isSomeCellInEditModeSelector,
        );

        if (!isSomeCellInEditMode) {
          moveHoverToCurrentCell(cellPosition);
        }
      },
    [isSomeCellInEditModeSelector, moveHoverToCurrentCell],
  );

  return {
    handleContainerMouseEnter,
  };
};
