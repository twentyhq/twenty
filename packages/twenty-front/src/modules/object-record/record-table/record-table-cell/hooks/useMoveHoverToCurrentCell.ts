import { useCallback } from 'react';

import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useStore } from 'jotai';

import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { isSomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/isSomeCellInEditModeComponentSelector';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const useMoveHoverToCurrentCell = (recordTableId: string) => {
  const setRecordTableHoverPosition = useSetAtomComponentState(
    recordTableHoverPositionComponentState,
    recordTableId,
  );

  const isSomeCellInEditMode = useAtomComponentSelectorCallbackState(
    isSomeCellInEditModeComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const moveHoverToCurrentCell = useCallback(
    (cellPosition: TableCellPosition) => {
      const cellInEditMode = store.get(isSomeCellInEditMode);

      if (!cellInEditMode) {
        setRecordTableHoverPosition(cellPosition);
      }
    },
    [store, isSomeCellInEditMode, setRecordTableHoverPosition],
  );

  return { moveHoverToCurrentCell };
};
