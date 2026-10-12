import { useCallback } from 'react';

import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useStore } from 'jotai';

import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { isSomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/isSomeCellInEditModeComponentSelector';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useIsTouchDevice } from 'twenty-ui/utilities';

export const useMoveHoverToCurrentCell = (recordTableId: string) => {
  const recordTableHoverPosition = useAtomComponentStateCallbackState(
    recordTableHoverPositionComponentState,
    recordTableId,
  );

  const isSomeCellInEditMode = useAtomComponentSelectorCallbackState(
    isSomeCellInEditModeComponentSelector,
    recordTableId,
  );

  const isTouchDevice = useIsTouchDevice();

  const store = useStore();

  const moveHoverToCurrentCell = useCallback(
    (cellPosition: TableCellPosition) => {
      // A tap synthesises mousemove before mousedown; hovering would mount a portal that steals the click.
      if (isTouchDevice || store.get(isSomeCellInEditMode)) {
        return;
      }

      const lastPosition = store.get(recordTableHoverPosition);

      if (
        lastPosition?.column === cellPosition.column &&
        lastPosition?.row === cellPosition.row
      ) {
        return;
      }

      store.set(recordTableHoverPosition, cellPosition);
    },
    [isTouchDevice, store, isSomeCellInEditMode, recordTableHoverPosition],
  );

  return { moveHoverToCurrentCell };
};
