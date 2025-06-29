import { getRecordBoardCardFocusId } from '@/object-record/record-board/record-board-card/utils/getRecordBoardCardFocusId';
import { focusedRecordBoardCardIndexesComponentState } from '@/object-record/record-board/states/focusedRecordBoardCardIndexesComponentState';
import { isRecordBoardCardFocusActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCardFocusActiveComponentState';
import { isRecordBoardCardFocusedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardFocusedComponentFamilyState';
import { BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useFocusedRecordBoardCard = (recordBoardId?: string) => {
  const isCardFocusedState = useRecoilComponentCallbackStateV2(
    isRecordBoardCardFocusedComponentFamilyState,
    recordBoardId,
  );

  const focusedBoardCardIndexesState = useRecoilComponentCallbackStateV2(
    focusedRecordBoardCardIndexesComponentState,
    recordBoardId,
  );

  const isCardFocusActiveState = useRecoilComponentCallbackStateV2(
    isRecordBoardCardFocusActiveComponentState,
    recordBoardId,
  );

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const unfocusBoardCard = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const focusedBoardCardIndexes = snapshot
          .getLoadable(focusedBoardCardIndexesState)
          .getValue();

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

        set(focusedBoardCardIndexesState, null);
        set(isCardFocusedState(focusedBoardCardIndexes), false);
        set(isCardFocusActiveState, false);
      },
    [
      focusedBoardCardIndexesState,
      isCardFocusedState,
      isCardFocusActiveState,
      recordBoardId,
      removeFocusItemFromFocusStackById,
    ],
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
          hotkeyScope: {
            scope: RecordIndexHotkeyScope.RecordIndex,
            customScopes: {
              goto: true,
              keyboardShortcutMenu: true,
              searchRecords: true,
            },
          },
          memoizeKey: focusId,
        });

        set(focusedBoardCardIndexesState, boardCardIndexes);
        set(isCardFocusedState(boardCardIndexes), true);
        set(isCardFocusActiveState, true);
      },
    [
      focusedBoardCardIndexesState,
      isCardFocusedState,
      isCardFocusActiveState,
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
