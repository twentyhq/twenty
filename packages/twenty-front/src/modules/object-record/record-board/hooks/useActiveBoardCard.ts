import { activeBoardCardIndexesComponentState } from '@/object-record/record-board/states/activeBoardCardIndexesComponentState';
import { isBoardCardActiveComponentFamilyState } from '@/object-record/record-board/states/isBoardCardActiveComponentFamilyState';
import { BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useActiveBoardCard = (recordBoardId?: string) => {
  const isCardActiveState = useRecoilComponentCallbackStateV2(
    isBoardCardActiveComponentFamilyState,
    recordBoardId,
  );

  const activeBoardCardIndexesState = useRecoilComponentCallbackStateV2(
    activeBoardCardIndexesComponentState,
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
