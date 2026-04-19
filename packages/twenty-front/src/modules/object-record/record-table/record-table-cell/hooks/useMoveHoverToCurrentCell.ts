import { useCallback } from 'react';

import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useStore } from 'jotai';

import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { iSsomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/iSsomeCellInEditModeComponentSelector';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const useMoveHoverToCurrentCell = (recordTableId: string) => {
  const setRecordTableHoverPosition = useSetAtomComponentState(
    recordTableHoverPositionComponentState,
    recordTableId,
  );

  const iSsomeCellInEditMode = useAtomComponentSelectorCallbackState(
    iSsomeCellInEditModeComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const moveHoverToCurrentCell = useCallback(
    (cellPosition: TableCellPosition) => {
      const cellInEditMode = store.get(iSsomeCellInEditMode);

      if (!cellInEditMode) {
        setRecordTableHoverPosition(cellPosition);
      }
    },
    [store, iSsomeCellInEditMode, setRecordTableHoverPosition],
  );

  return { moveHoverToCurrentCell };
};
