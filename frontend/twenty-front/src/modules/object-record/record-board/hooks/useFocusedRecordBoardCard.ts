import { getRecordBoardCardFocusId } from '@/object-record/record-board/record-board-card/utils/getRecordBoardCardFocusId';
import { focusedRecordBoardCardIndexesComponentState } from '@/object-record/record-board/states/focusedRecordBoardCardIndexesComponentState';
import { isRecordBoardCardFocusActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCardFocusActiveComponentState';
import { isRecordBoardCardFocusedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardFocusedComponentFamilyState';
import { type BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useFocusedRecordBoardCard = (recordBoardId?: string) => {
  const store = useStore();
  const isCardFocused = useAtomComponentFamilyStateCallbackState(
    isRecordBoardCardFocusedComponentFamilyState,
    recordBoardId,
  );

  const focusedBoardCardIndexes = useAtomComponentStateCallbackState(
    focusedRecordBoardCardIndexesComponentState,
    recordBoardId,
  );

  const isCardFocusActive = useAtomComponentStateCallbackState(
    isRecordBoardCardFocusActiveComponentState,
    recordBoardId,
  );

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const unfocusBoardCard = useCallback(() => {
    const currentFocusedBoardCardIndexes = store.get(focusedBoardCardIndexes);

    if (!isDefined(currentFocusedBoardCardIndexes)) {
      return;
    }

    const focusId = getRecordBoardCardFocusId({
      recordBoardId: recordBoardId || '',
      cardIndexes: currentFocusedBoardCardIndexes,
    });

    removeFocusItemFromFocusStackById({
      focusId,
    });

    store.set(focusedBoardCardIndexes, null);
    store.set(isCardFocused(currentFocusedBoardCardIndexes), false);
    store.set(isCardFocusActive, false);
  }, [
    store,
    focusedBoardCardIndexes,
    isCardFocused,
    isCardFocusActive,
    recordBoardId,
    removeFocusItemFromFocusStackById,
  ]);

  const focusBoardCard = useCallback(
    (boardCardIndexes: BoardCardIndexes) => {
      const currentFocusedBoardCardIndexes = store.get(focusedBoardCardIndexes);

      if (
        isDefined(currentFocusedBoardCardIndexes) &&
        (currentFocusedBoardCardIndexes.rowIndex !==
          boardCardIndexes.rowIndex ||
          currentFocusedBoardCardIndexes.columnIndex !==
            boardCardIndexes.columnIndex)
      ) {
        store.set(isCardFocused(currentFocusedBoardCardIndexes), false);

        const currentFocusId = getRecordBoardCardFocusId({
          recordBoardId: recordBoardId || '',
          cardIndexes: currentFocusedBoardCardIndexes,
        });

        removeFocusItemFromFocusStackById({
          focusId: currentFocusId,
        });
      }

      const focusId = getRecordBoardCardFocusId({
        recordBoardId: recordBoardId || '',
        cardIndexes: boardCardIndexes,
      });

      pushFocusItemToFocusStack({
        focusId,
        component: {
          type: FocusComponentType.RECORD_BOARD_CARD,
          instanceId: focusId,
        },
      });

      store.set(focusedBoardCardIndexes, boardCardIndexes);
      store.set(isCardFocused(boardCardIndexes), true);
      store.set(isCardFocusActive, true);
    },
    [
      store,
      focusedBoardCardIndexes,
      isCardFocused,
      isCardFocusActive,
      recordBoardId,
      pushFocusItemToFocusStack,
      removeFocusItemFromFocusStackById,
    ],
  );

  return {
    focusBoardCard,
    unfocusBoardCard,
  };
};
