import { useCallback } from 'react';

import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useStore } from 'jotai';

import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { isSomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/isSomeCellInEditModeComponentSelector';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';

export const useMoveHoverToCurrentCell = (recordTableId: string) => {
  const setHoverPosition = useSetRecoilComponentStateV2(
    recordTableHoverPositionComponentState,
    recordTableId,
  );

  const isSomeCellInEditModeAtom = useRecoilComponentSelectorCallbackStateV2(
    isSomeCellInEditModeComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const moveHoverToCurrentCell = useCallback(
    (cellPosition: TableCellPosition) => {
      const isSomeCellInEditMode = store.get(isSomeCellInEditModeAtom);

      if (!isSomeCellInEditMode) {
        setHoverPosition(cellPosition);
      }
    },
    [store, isSomeCellInEditModeAtom, setHoverPosition],
  );

  return { moveHoverToCurrentCell };
};
