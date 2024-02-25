import { RecordBoardDeprecatedScopeInternalContext } from '@/object-record/record-board-deprecated/scopes/scope-internal-context/RecordBoardDeprecatedScopeInternalContext';
import { getRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/utils/getRecordBoardDeprecatedScopedStates';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type useRecordBoardDeprecatedScopedStatesProps = {
  recordBoardScopeId?: string;
};

export const useRecordBoardDeprecatedScopedStates = (
  args?: useRecordBoardDeprecatedScopedStatesProps,
) => {
  const { recordBoardScopeId } = args ?? {};

  const scopeId = useAvailableScopeIdOrThrow(
    RecordBoardDeprecatedScopeInternalContext,
    recordBoardScopeId,
  );

  const {
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
  } = getRecordBoardDeprecatedScopedStates({
    recordBoardScopeId: scopeId,
  });

  return {
    scopeId,
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
