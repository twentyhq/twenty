import { useCallback } from 'react';
import { useStore } from 'jotai';

import { activeRecordBoardCardIndexesComponentState } from '@/object-record/record-board/states/activeRecordBoardCardIndexesComponentState';
import { isRecordBoardCardActiveComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardActiveComponentFamilyState';
import { type BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { isDefined } from 'twenty-shared/utils';

export const useActiveRecordBoardCard = (recordBoardId?: string) => {
  const isCardActiveState = useAtomComponentFamilyStateCallbackState(
    isRecordBoardCardActiveComponentFamilyState,
    recordBoardId,
  );

  const activeBoardCardIndexesState = useAtomComponentStateCallbackState(
    activeRecordBoardCardIndexesComponentState,
    recordBoardId,
  );

  const store = useStore();

  const deactivateBoardCard = useCallback(() => {
    const activeBoardCardIndexes = store.get(activeBoardCardIndexesState);

    if (!isDefined(activeBoardCardIndexes)) {
      return;
    }

    store.set(activeBoardCardIndexesState, null);
    store.set(isCardActiveState(activeBoardCardIndexes), false);
  }, [activeBoardCardIndexesState, isCardActiveState, store]);

  const activateBoardCard = useCallback(
    (boardCardIndexes: BoardCardIndexes) => {
      const activeBoardCardIndexes = store.get(activeBoardCardIndexesState);

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
