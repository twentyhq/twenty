import { useCallback } from 'react';
import { useStore } from 'jotai';

import { activeRecordBoardCardIndexesComponentState } from '@/object-record/record-board/states/activeRecordBoardCardIndexesComponentState';
import { isRecordBoardCardActiveComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardActiveComponentFamilyState';
import { type BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { isDefined } from 'twenty-shared/utils';

export const useActiveRecordBoardCard = (recordBoardId?: string) => {
  const isCardActiveState = useRecoilComponentFamilyStateCallbackStateV2(
    isRecordBoardCardActiveComponentFamilyState,
    recordBoardId,
  );

  const activeBoardCardIndexesState = useRecoilComponentStateCallbackStateV2(
    activeRecordBoardCardIndexesComponentState,
    recordBoardId,
  );

  const store = useStore();

  const deactivateBoardCard = useCallback(() => {
    const activeBoardCardIndexes = store.get(activeBoardCardIndexesState) as
      | BoardCardIndexes
      | null
      | undefined;

    if (!isDefined(activeBoardCardIndexes)) {
      return;
    }

    store.set(activeBoardCardIndexesState, null);
    store.set(isCardActiveState(activeBoardCardIndexes), false);
  }, [activeBoardCardIndexesState, isCardActiveState, store]);

  const activateBoardCard = useCallback(
    (boardCardIndexes: BoardCardIndexes) => {
      const activeBoardCardIndexes = store.get(activeBoardCardIndexesState) as
        | BoardCardIndexes
        | null
        | undefined;

      if (
        activeBoardCardIndexes?.rowIndex === boardCardIndexes.rowIndex &&
        activeBoardCardIndexes?.columnIndex === boardCardIndexes.columnIndex
      ) {
        return;
      }

      if (isDefined(activeBoardCardIndexes)) {
        store.set(isCardActiveState(activeBoardCardIndexes), false);
      }

      store.set(activeBoardCardIndexesState, boardCardIndexes);
      store.set(isCardActiveState(boardCardIndexes), true);
    },
    [activeBoardCardIndexesState, isCardActiveState, store],
  );

  return {
    activateBoardCard,
    deactivateBoardCard,
  };
};
