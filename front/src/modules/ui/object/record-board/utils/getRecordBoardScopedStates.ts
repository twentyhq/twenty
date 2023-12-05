import { activeRecordBoardCardIdsScopedState } from '@/ui/object/record-board/states/activeRecordBoardCardIdsScopedState';
import { availableRecordBoardCardFieldsScopedState } from '@/ui/object/record-board/states/availableRecordBoardCardFieldsScopedState';
import { isCompactViewEnabledScopedState } from '@/ui/object/record-board/states/isCompactViewEnabledScopedState';
import { isRecordBoardLoadedScopedState } from '@/ui/object/record-board/states/isRecordBoardLoadedScopedState';
import { onFieldsChangeScopedState } from '@/ui/object/record-board/states/onFieldsChangeScopedState';
import { recordBoardColumnsScopedState } from '@/ui/object/record-board/states/recordBoardColumnsScopedState';
import { recordBoardFiltersScopedState } from '@/ui/object/record-board/states/recordBoardFiltersScopedState';
import { recordBoardSortsScopedState } from '@/ui/object/record-board/states/recordBoardSortsScopedState';
import { savedOpportunitiesScopedState } from '@/ui/object/record-board/states/savedOpportunitiesScopedState';
import { savedPipelineStepsScopedState } from '@/ui/object/record-board/states/savedPipelineStepsScopedState';
import { savedRecordBoardColumnsScopedState } from '@/ui/object/record-board/states/savedRecordBoardColumnsScopedState';
import { savedRecordsScopedState } from '@/ui/object/record-board/states/savedRecordsScopedState';
import { hiddenRecordBoardCardFieldsScopedSelector } from '@/ui/object/record-board/states/selectors/hiddenRecordBoardCardFieldsScopedSelector';
import { recordBoardCardFieldsByKeyScopedSelector } from '@/ui/object/record-board/states/selectors/recordBoardCardFieldsByKeyScopedSelector';
import { selectedRecordBoardCardIdsScopedSelector } from '@/ui/object/record-board/states/selectors/selectedRecordBoardCardIdsScopedSelector';
import { visibleRecordBoardCardFieldsScopedSelector } from '@/ui/object/record-board/states/selectors/visibleRecordBoardCardFieldsScopedSelector';
import { getScopedState } from '@/ui/utilities/recoil-scope/utils/getScopedState';

export const getRecordBoardScopedStates = ({
  recordBoardScopeId,
}: {
  recordBoardScopeId: string;
}) => {
  const activeCardIdsState = getScopedState(
    activeRecordBoardCardIdsScopedState,
    recordBoardScopeId,
  );

  const availableBoardCardFieldsState = getScopedState(
    availableRecordBoardCardFieldsScopedState,
    recordBoardScopeId,
  );

  const boardColumnsState = getScopedState(
    recordBoardColumnsScopedState,
    recordBoardScopeId,
  );

  const isBoardLoadedState = getScopedState(
    isRecordBoardLoadedScopedState,
    recordBoardScopeId,
  );

  const isCompactViewEnabledState = getScopedState(
    isCompactViewEnabledScopedState,
    recordBoardScopeId,
  );

  const savedBoardColumnsState = getScopedState(
    savedRecordBoardColumnsScopedState,
    recordBoardScopeId,
  );

  const boardFiltersState = getScopedState(
    recordBoardFiltersScopedState,
    recordBoardScopeId,
  );

  const boardSortsState = getScopedState(
    recordBoardSortsScopedState,
    recordBoardScopeId,
  );

  const savedCompaniesState = getScopedState(
    savedRecordsScopedState,
    recordBoardScopeId,
  );

  const savedOpportunitiesState = getScopedState(
    savedOpportunitiesScopedState,
    recordBoardScopeId,
  );

  const savedPipelineStepsState = getScopedState(
    savedPipelineStepsScopedState,
    recordBoardScopeId,
  );

  const onFieldsChangeState = getScopedState(
    onFieldsChangeScopedState,
    recordBoardScopeId,
  );

  // TODO: Family scoped selector
  const boardCardFieldsByKeySelector =
    recordBoardCardFieldsByKeyScopedSelector(recordBoardScopeId);

  const hiddenBoardCardFieldsSelector =
    hiddenRecordBoardCardFieldsScopedSelector({
      scopeId: recordBoardScopeId,
    });

  const selectedCardIdsSelector = selectedRecordBoardCardIdsScopedSelector({
    scopeId: recordBoardScopeId,
  });

  const visibleBoardCardFieldsSelector =
    visibleRecordBoardCardFieldsScopedSelector({
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
    onFieldsChangeState,
    boardCardFieldsByKeySelector,
    hiddenBoardCardFieldsSelector,
    selectedCardIdsSelector,
    visibleBoardCardFieldsSelector,
    savedCompaniesState,
    savedOpportunitiesState,
    savedPipelineStepsState,
  };
};
