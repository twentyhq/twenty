import { activeRecordBoardDeprecatedCardIdsScopedState } from '@/object-record/record-board-deprecated/states/activeRecordBoardDeprecatedCardIdsScopedState';
import { availableRecordBoardDeprecatedCardFieldsScopedState } from '@/object-record/record-board-deprecated/states/availableRecordBoardDeprecatedCardFieldsScopedState';
import { isCompactViewEnabledScopedState } from '@/object-record/record-board-deprecated/states/isCompactViewEnabledScopedState';
import { isRecordBoardDeprecatedLoadedScopedState } from '@/object-record/record-board-deprecated/states/isRecordBoardDeprecatedLoadedScopedState';
import { onFieldsChangeScopedState } from '@/object-record/record-board-deprecated/states/onFieldsChangeScopedState';
import { recordBoardColumnsScopedState } from '@/object-record/record-board-deprecated/states/recordBoardColumnsScopedState';
import { recordBoardFiltersScopedState } from '@/object-record/record-board-deprecated/states/recordBoardDeprecatedFiltersScopedState';
import { recordBoardSortsScopedState } from '@/object-record/record-board-deprecated/states/recordBoardDeprecatedSortsScopedState';
import { savedOpportunitiesScopedState } from '@/object-record/record-board-deprecated/states/savedOpportunitiesScopedState';
import { savedPipelineStepsScopedState } from '@/object-record/record-board-deprecated/states/savedPipelineStepsScopedState';
import { savedRecordBoardDeprecatedColumnsScopedState } from '@/object-record/record-board-deprecated/states/savedRecordBoardDeprecatedColumnsScopedState';
import { savedRecordsScopedState } from '@/object-record/record-board-deprecated/states/savedRecordsScopedState';
import { hiddenRecordBoardDeprecatedCardFieldsScopedSelector } from '@/object-record/record-board-deprecated/states/selectors/hiddenRecordBoardDeprecatedCardFieldsScopedSelector';
import { recordBoardCardFieldsByKeyScopedSelector } from '@/object-record/record-board-deprecated/states/selectors/recordBoardDeprecatedCardFieldsByKeyScopedSelector';
import { selectedRecordBoardDeprecatedCardIdsScopedSelector } from '@/object-record/record-board-deprecated/states/selectors/selectedRecordBoardDeprecatedCardIdsScopedSelector';
import { visibleRecordBoardDeprecatedCardFieldsScopedSelector } from '@/object-record/record-board-deprecated/states/selectors/visibleRecordBoardDeprecatedCardFieldsScopedSelector';
import { getScopedStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedStateDeprecated';

export const getRecordBoardDeprecatedScopedStates = ({
  recordBoardScopeId,
}: {
  recordBoardScopeId: string;
}) => {
  const activeCardIdsState = getScopedStateDeprecated(
    activeRecordBoardDeprecatedCardIdsScopedState,
    recordBoardScopeId,
  );

  const availableBoardCardFieldsState = getScopedStateDeprecated(
    availableRecordBoardDeprecatedCardFieldsScopedState,
    recordBoardScopeId,
  );

  const boardColumnsState = getScopedStateDeprecated(
    recordBoardColumnsScopedState,
    recordBoardScopeId,
  );

  const isBoardLoadedState = getScopedStateDeprecated(
    isRecordBoardDeprecatedLoadedScopedState,
    recordBoardScopeId,
  );

  const isCompactViewEnabledState = getScopedStateDeprecated(
    isCompactViewEnabledScopedState,
    recordBoardScopeId,
  );

  const savedBoardColumnsState = getScopedStateDeprecated(
    savedRecordBoardDeprecatedColumnsScopedState,
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
    hiddenRecordBoardDeprecatedCardFieldsScopedSelector({
      scopeId: recordBoardScopeId,
    });

  const selectedCardIdsSelector =
    selectedRecordBoardDeprecatedCardIdsScopedSelector({
      scopeId: recordBoardScopeId,
    });

  const visibleBoardCardFieldsSelector =
    visibleRecordBoardDeprecatedCardFieldsScopedSelector({
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
