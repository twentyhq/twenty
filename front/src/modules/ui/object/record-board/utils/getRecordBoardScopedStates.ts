import { activeCardIdsScopedState } from '@/ui/object/record-board/states/activeCardIdsScopedState';
import { availableBoardCardFieldsScopedState } from '@/ui/object/record-board/states/availableBoardCardFieldsScopedState';
import { boardColumnsScopedState } from '@/ui/object/record-board/states/boardColumnsScopedState';
import { boardFiltersScopedState } from '@/ui/object/record-board/states/boardFiltersScopedState';
import { boardSortsScopedState } from '@/ui/object/record-board/states/boardSortsScopedState';
import { isBoardLoadedScopedState } from '@/ui/object/record-board/states/isBoardLoadedScopedState';
import { isCompactViewEnabledScopedState } from '@/ui/object/record-board/states/isCompactViewEnabledScopedState';
import { savedBoardColumnsScopedState } from '@/ui/object/record-board/states/savedBoardColumnsScopedState';
import { boardCardFieldsByKeyScopedSelector } from '@/ui/object/record-board/states/selectors/boardCardFieldsByKeyScopedSelector';
import { canPersistBoardCardFieldsScopedFamilySelector } from '@/ui/object/record-board/states/selectors/canPersistBoardCardFieldsScopedFamilySelector';
import { hiddenBoardCardFieldsScopedSelector } from '@/ui/object/record-board/states/selectors/hiddenBoardCardFieldsScopedSelector';
import { selectedCardIdsScopedSelector } from '@/ui/object/record-board/states/selectors/selectedCardIdsScopedSelector';
import { visibleBoardCardFieldsScopedSelector } from '@/ui/object/record-board/states/selectors/visibleBoardCardFieldsScopedSelector';
import { getScopedState } from '@/ui/utilities/recoil-scope/utils/getScopedState';

export const getRecordBoardScopedStates = ({
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

  const boardFiltersState = getScopedState(
    boardFiltersScopedState,
    recordBoardScopeId,
  );

  const boardSortsState = getScopedState(
    boardSortsScopedState,
    recordBoardScopeId,
  );

  // TODO: Family scoped selector
  const boardCardFieldsByKeySelector =
    boardCardFieldsByKeyScopedSelector(recordBoardScopeId);

  const hiddenBoardCardFieldsSelector = hiddenBoardCardFieldsScopedSelector({
    scopeId: recordBoardScopeId,
  });

  const selectedCardIdsSelector = selectedCardIdsScopedSelector({
    scopeId: recordBoardScopeId,
  });

  const visibleBoardCardFieldsSelector = visibleBoardCardFieldsScopedSelector({
    scopeId: recordBoardScopeId,
  });

  return {
    activeCardIdsState,
    availableBoardCardFieldsState,
    boardColumnsState,
    isBoardLoadedState,
    isCompactViewEnabledState,
    savedBoardColumnsState,
    boardFiltersState,
    boardSortsState,
    boardCardFieldsByKeySelector,
    canPersistBoardCardFieldsScopedFamilySelector,
    hiddenBoardCardFieldsSelector,
    selectedCardIdsSelector,
    visibleBoardCardFieldsSelector,
  };
};
