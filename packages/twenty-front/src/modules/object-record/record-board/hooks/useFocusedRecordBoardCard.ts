import { getRecordBoardCardFocusId } from '@/object-record/record-board/record-board-card/utils/getRecordBoardCardFocusId';
import { focusedRecordBoardCardIndexesComponentState } from '@/object-record/record-board/states/focusedRecordBoardCardIndexesComponentState';
import { isRecordBoardCardFocusActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCardFocusActiveComponentState';
import { isRecordBoardCardFocusedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardFocusedComponentFamilyState';
import { type BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useFocusedRecordBoardCard = (recordBoardId?: string) => {
  const store = useStore();
  const isCardFocusedAtom = useRecoilComponentFamilyStateCallbackStateV2(
    isRecordBoardCardFocusedComponentFamilyState,
    recordBoardId,
  );

  const focusedBoardCardIndexesAtom = useRecoilComponentStateCallbackStateV2(
    focusedRecordBoardCardIndexesComponentState,
    recordBoardId,
  );

  const isCardFocusActiveAtom = useRecoilComponentStateCallbackStateV2(
    isRecordBoardCardFocusActiveComponentState,
    recordBoardId,
  );

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const unfocusBoardCard = useCallback(() => {
    const focusedBoardCardIndexes = store.get(focusedBoardCardIndexesAtom) as
      | BoardCardIndexes
      | null
      | undefined;

    if (!isDefined(focusedBoardCardIndexes)) {
      return;
    }

    const focusId = getRecordBoardCardFocusId({
      recordBoardId: recordBoardId || '',
      cardIndexes: focusedBoardCardIndexes,
    });

    removeFocusItemFromFocusStackById({
      focusId,
    });

    store.set(focusedBoardCardIndexesAtom, null);
    store.set(isCardFocusedAtom(focusedBoardCardIndexes), false);
    store.set(isCardFocusActiveAtom, false);
  }, [
    store,
    focusedBoardCardIndexesAtom,
    isCardFocusedAtom,
    isCardFocusActiveAtom,
    recordBoardId,
    removeFocusItemFromFocusStackById,
  ]);

  const focusBoardCard = useCallback(
    (boardCardIndexes: BoardCardIndexes) => {
      const focusedBoardCardIndexes = store.get(focusedBoardCardIndexesAtom) as
        | BoardCardIndexes
        | null
        | undefined;

      if (
        isDefined(focusedBoardCardIndexes) &&
        (focusedBoardCardIndexes.rowIndex !== boardCardIndexes.rowIndex ||
          focusedBoardCardIndexes.columnIndex !== boardCardIndexes.columnIndex)
      ) {
        store.set(isCardFocusedAtom(focusedBoardCardIndexes), false);

        const currentFocusId = getRecordBoardCardFocusId({
          recordBoardId: recordBoardId || '',
          cardIndexes: focusedBoardCardIndexes,
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

      store.set(focusedBoardCardIndexesAtom, boardCardIndexes);
      store.set(isCardFocusedAtom(boardCardIndexes), true);
      store.set(isCardFocusActiveAtom, true);
    },
    [
      store,
      focusedBoardCardIndexesAtom,
      isCardFocusedAtom,
      isCardFocusActiveAtom,
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
