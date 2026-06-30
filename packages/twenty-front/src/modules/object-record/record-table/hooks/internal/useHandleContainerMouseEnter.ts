import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useMoveHoverToCurrentCell } from '@/object-record/record-table/record-table-cell/hooks/useMoveHoverToCurrentCell';
import { isSomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/isSomeCellInEditModeComponentSelector';
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

  const isSomeCellInEditModeSelector = useAtomComponentSelectorCallbackState(
    isSomeCellInEditModeComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const handleContainerMouseEnter = useCallback(
    ({ cellPosition }: HandleContainerMouseEnterArgs) => {
      const isSomeCellInEditMode = store.get(isSomeCellInEditModeSelector);

      if (!isSomeCellInEditMode) {
        moveHoverToCurrentCell(cellPosition);
      }
    },
    [isSomeCellInEditModeSelector, moveHoverToCurrentCell, store],
  );

  return {
    handleContainerMouseEnter,
  };
};
