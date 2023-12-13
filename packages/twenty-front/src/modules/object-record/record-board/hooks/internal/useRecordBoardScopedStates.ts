import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { getRecordBoardScopedStates } from '@/object-record/record-board/utils/getRecordBoardScopedStates';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type useRecordBoardScopedStatesProps = {
  recordBoardScopeId?: string;
};

export const useRecordBoardScopedStates = (
  args?: useRecordBoardScopedStatesProps,
) => {
  const { recordBoardScopeId } = args ?? {};

  const scopeId = useAvailableScopeIdOrThrow(
    RecordBoardScopeInternalContext,
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
  } = getRecordBoardScopedStates({
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
