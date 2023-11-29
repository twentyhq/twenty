import { activeCardIdsScopedState } from '@/ui/object/record-board/states/activeCardIdsScopedState';
import { availableBoardCardFieldsScopedState } from '@/ui/object/record-board/states/availableBoardCardFieldsScopedState';
import { boardColumnsScopedState } from '@/ui/object/record-board/states/boardColumnsScopedState';
import { isBoardLoadedScopedState } from '@/ui/object/record-board/states/isBoardLoadedScopedState';
import { isCompactViewEnabledScopedState } from '@/ui/object/record-board/states/isCompactViewEnabledScopedState';
import { savedBoardColumnsScopedState } from '@/ui/object/record-board/states/savedBoardColumnsScopedState';
import { getScopedState } from '@/ui/utilities/recoil-scope/utils/getScopedState';

export const getBoardScopedStates = ({
  recordBoardScopeId,
}: {
  recordBoardScopeId: string;
}) => {
  const activeCardIdsState = getScopedState(
    activeCardIdsScopedState,
    recordBoardScopeId,
  );

  const availableBoardCardFieldsState = getScopedState(
    availableBoardCardFieldsScopedState,
    recordBoardScopeId,
  );

  const boardColumnsState = getScopedState(
    boardColumnsScopedState,
    recordBoardScopeId,
  );

  const isBoardLoadedState = getScopedState(
    isBoardLoadedScopedState,
    recordBoardScopeId,
  );

  const isCompactViewEnabledState = getScopedState(
    isCompactViewEnabledScopedState,
    recordBoardScopeId,
  );

  const savedBoardColumnsState = getScopedState(
    savedBoardColumnsScopedState,
    recordBoardScopeId,
  );

  return {
    activeCardIdsState,
    availableBoardCardFieldsState,
    boardColumnsState,
    isBoardLoadedState,
    isCompactViewEnabledState,
    savedBoardColumnsState,
  };
};
