import { activeRecordBoardCardIdsScopedState } from '@/object-record/record-board/states/activeRecordBoardCardIdsScopedState';
import { availableRecordBoardCardFieldsScopedState } from '@/object-record/record-board/states/availableRecordBoardCardFieldsScopedState';
import { isCompactViewEnabledScopedState } from '@/object-record/record-board/states/isCompactViewEnabledScopedState';
import { isRecordBoardLoadedScopedState } from '@/object-record/record-board/states/isRecordBoardLoadedScopedState';
import { onFieldsChangeScopedState } from '@/object-record/record-board/states/onFieldsChangeScopedState';
import { recordBoardColumnsScopedState } from '@/object-record/record-board/states/recordBoardColumnsScopedState';
import { recordBoardFiltersScopedState } from '@/object-record/record-board/states/recordBoardFiltersScopedState';
import { recordBoardSortsScopedState } from '@/object-record/record-board/states/recordBoardSortsScopedState';
import { savedOpportunitiesScopedState } from '@/object-record/record-board/states/savedOpportunitiesScopedState';
import { savedPipelineStepsScopedState } from '@/object-record/record-board/states/savedPipelineStepsScopedState';
import { savedRecordBoardColumnsScopedState } from '@/object-record/record-board/states/savedRecordBoardColumnsScopedState';
import { savedRecordsScopedState } from '@/object-record/record-board/states/savedRecordsScopedState';
import { hiddenRecordBoardCardFieldsScopedSelector } from '@/object-record/record-board/states/selectors/hiddenRecordBoardCardFieldsScopedSelector';
import { recordBoardCardFieldsByKeyScopedSelector } from '@/object-record/record-board/states/selectors/recordBoardCardFieldsByKeyScopedSelector';
import { selectedRecordBoardCardIdsScopedSelector } from '@/object-record/record-board/states/selectors/selectedRecordBoardCardIdsScopedSelector';
import { visibleRecordBoardCardFieldsScopedSelector } from '@/object-record/record-board/states/selectors/visibleRecordBoardCardFieldsScopedSelector';
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
