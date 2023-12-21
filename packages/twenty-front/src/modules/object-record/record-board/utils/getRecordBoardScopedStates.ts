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
import { getScopedStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedStateDeprecated';

export const getRecordBoardScopedStates = ({
  recordBoardScopeId,
}: {
  recordBoardScopeId: string;
}) => {
  const activeCardIdsState = getScopedStateDeprecated(
    activeRecordBoardCardIdsScopedState,
    recordBoardScopeId,
  );

  const availableBoardCardFieldsState = getScopedStateDeprecated(
    availableRecordBoardCardFieldsScopedState,
    recordBoardScopeId,
  );

  const boardColumnsState = getScopedStateDeprecated(
    recordBoardColumnsScopedState,
    recordBoardScopeId,
  );

  const isBoardLoadedState = getScopedStateDeprecated(
    isRecordBoardLoadedScopedState,
    recordBoardScopeId,
  );

  const isCompactViewEnabledState = getScopedStateDeprecated(
    isCompactViewEnabledScopedState,
    recordBoardScopeId,
  );

  const savedBoardColumnsState = getScopedStateDeprecated(
    savedRecordBoardColumnsScopedState,
    recordBoardScopeId,
  );

  const boardFiltersState = getScopedStateDeprecated(
    recordBoardFiltersScopedState,
    recordBoardScopeId,
  );

  const boardSortsState = getScopedStateDeprecated(
    recordBoardSortsScopedState,
    recordBoardScopeId,
  );

  const savedCompaniesState = getScopedStateDeprecated(
    savedRecordsScopedState,
    recordBoardScopeId,
  );

  const savedOpportunitiesState = getScopedStateDeprecated(
    savedOpportunitiesScopedState,
    recordBoardScopeId,
  );

  const savedPipelineStepsState = getScopedStateDeprecated(
    savedPipelineStepsScopedState,
    recordBoardScopeId,
  );

  const onFieldsChangeState = getScopedStateDeprecated(
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
