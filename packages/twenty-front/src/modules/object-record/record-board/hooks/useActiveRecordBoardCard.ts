import { activeRecordBoardCardIndexesComponentState } from '@/object-record/record-board/states/activeRecordBoardCardIndexesComponentState';
import { isRecordBoardCardActiveComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardActiveComponentFamilyState';
import { BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useActiveRecordBoardCard = (recordBoardId?: string) => {
  const isCardActiveState = useRecoilComponentCallbackState(
    isRecordBoardCardActiveComponentFamilyState,
    recordBoardId,
  );

  const activeBoardCardIndexesState = useRecoilComponentCallbackState(
    activeRecordBoardCardIndexesComponentState,
    recordBoardId,
  );

  const deactivateBoardCard = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const activeBoardCardIndexes = snapshot
          .getLoadable(activeBoardCardIndexesState)
          .getValue();

        if (!isDefined(activeBoardCardIndexes)) {
          return;
        }

        set(activeBoardCardIndexesState, null);
        set(isCardActiveState(activeBoardCardIndexes), false);
      },
    [activeBoardCardIndexesState, isCardActiveState],
  );

  const activateBoardCard = useRecoilCallback(
    ({ set, snapshot }) =>
      (boardCardIndexes: BoardCardIndexes) => {
        const activeBoardCardIndexes = snapshot
          .getLoadable(activeBoardCardIndexesState)
          .getValue();

        if (
          activeBoardCardIndexes?.rowIndex === boardCardIndexes.rowIndex &&
          activeBoardCardIndexes?.columnIndex === boardCardIndexes.columnIndex
        ) {
          return;
        }

        if (isDefined(activeBoardCardIndexes)) {
          set(isCardActiveState(activeBoardCardIndexes), false);
        }

        set(activeBoardCardIndexesState, boardCardIndexes);
        set(isCardActiveState(boardCardIndexes), true);
      },
    [activeBoardCardIndexesState, isCardActiveState],
  );

  return {
    activateBoardCard,
    deactivateBoardCard,
  };
};
