import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useMoveHoverToCurrentCell } from '@/object-record/record-table/record-table-cell/hooks/useMoveHoverToCurrentCell';
import { iSsomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/iSsomeCellInEditModeComponentSelector';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';

export type HandleContainerMouseEnterArgs = {
  cellPosition: TableCellPosition;
};

export const useHandleContainerMouseEnter = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const { moveHoverToCurrentCell } = useMoveHoverToCurrentCell(recordTableId);

  const iSsomeCellInEditModeSelector = useAtomComponentSelectorCallbackState(
    iSsomeCellInEditModeComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const handleContainerMouseEnter = useCallback(
    ({ cellPosition }: HandleContainerMouseEnterArgs) => {
      const iSsomeCellInEditMode = store.get(iSsomeCellInEditModeSelector);

      if (!iSsomeCellInEditMode) {
        moveHoverToCurrentCell(cellPosition);
      }
    },
    [iSsomeCellInEditModeSelector, moveHoverToCurrentCell, store],
  );

  return {
    handleContainerMouseEnter,
  };
};
