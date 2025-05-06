import { focusedBoardCardIndexesComponentState } from '@/object-record/record-board/states/focusedBoardCardIndexesComponentState';
import { isBoardCardFocusActiveComponentState } from '@/object-record/record-board/states/isBoardCardFocusActiveComponentState';
import { isBoardCardFocusedComponentFamilyState } from '@/object-record/record-board/states/isBoardCardFocusedComponentFamilyState';
import { BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useFocusedBoardCard = (recordBoardId?: string) => {
  const isCardFocusedState = useRecoilComponentCallbackStateV2(
    isBoardCardFocusedComponentFamilyState,
    recordBoardId,
  );

  const focusedBoardCardIndexesState = useRecoilComponentCallbackStateV2(
    focusedBoardCardIndexesComponentState,
    recordBoardId,
  );

  const isCardFocusActiveState = useRecoilComponentCallbackStateV2(
    isBoardCardFocusActiveComponentState,
    recordBoardId,
  );

  const unfocusBoardCard = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const focusedBoardCardIndexes = snapshot
          .getLoadable(focusedBoardCardIndexesState)
          .getValue();

        if (!isDefined(focusedBoardCardIndexes)) {
          return;
        }

        set(focusedBoardCardIndexesState, null);
        set(isCardFocusedState(focusedBoardCardIndexes), false);
        set(isCardFocusActiveState, false);
      },
    [focusedBoardCardIndexesState, isCardFocusedState, isCardFocusActiveState],
  );

  const focusBoardCard = useRecoilCallback(
    ({ set, snapshot }) =>
      (boardCardIndexes: BoardCardIndexes) => {
        const focusedBoardCardIndexes = snapshot
          .getLoadable(focusedBoardCardIndexesState)
          .getValue();

        if (
          isDefined(focusedBoardCardIndexes) &&
          (focusedBoardCardIndexes.rowIndex !== boardCardIndexes.rowIndex ||
            focusedBoardCardIndexes.columnIndex !==
              boardCardIndexes.columnIndex)
        ) {
          set(isCardFocusedState(focusedBoardCardIndexes), false);
        }

        set(focusedBoardCardIndexesState, boardCardIndexes);
        set(isCardFocusedState(boardCardIndexes), true);
        set(isCardFocusActiveState, true);
      },
    [focusedBoardCardIndexesState, isCardFocusedState, isCardFocusActiveState],
  );

  return {
    focusBoardCard,
    unfocusBoardCard,
  };
};
