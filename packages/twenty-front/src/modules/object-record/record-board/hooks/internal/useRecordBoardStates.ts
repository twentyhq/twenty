import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { isFirstRecordBoardColumnComponentFamilyState } from '@/object-record/record-board/states/isFirstRecordBoardColumnComponentFamilyState';
import { isLastRecordBoardColumnComponentFamilyState } from '@/object-record/record-board/states/isLastRecordBoardColumnComponentFamilyState';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';
import { isRecordBoardFetchingRecordsByColumnFamilyState } from '@/object-record/record-board/states/isRecordBoardFetchingRecordsByColumnFamilyState';
import { isRecordBoardFetchingRecordsComponentState } from '@/object-record/record-board/states/isRecordBoardFetchingRecordsComponentState';
import { recordBoardColumnIdsComponentState } from '@/object-record/record-board/states/recordBoardColumnIdsComponentState';
import { recordBoardFieldDefinitionsComponentState } from '@/object-record/record-board/states/recordBoardFieldDefinitionsComponentState';
import { recordBoardFiltersComponentState } from '@/object-record/record-board/states/recordBoardFiltersComponentState';
import { recordBoardKanbanFieldMetadataNameComponentState } from '@/object-record/record-board/states/recordBoardKanbanFieldMetadataNameComponentState';
import { recordBoardObjectSingularNameComponentState } from '@/object-record/record-board/states/recordBoardObjectSingularNameComponentState';
import { recordBoardRecordIdsByColumnIdComponentFamilyState } from '@/object-record/record-board/states/recordBoardRecordIdsByColumnIdComponentFamilyState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { recordBoardSortsComponentState } from '@/object-record/record-board/states/recordBoardSortsComponentState';
import { recordBoardColumnsComponentFamilySelector } from '@/object-record/record-board/states/selectors/recordBoardColumnsComponentFamilySelector';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { recordBoardShouldFetchMoreComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardShouldFetchMoreComponentFamilySelector';
import { recordBoardVisibleFieldDefinitionsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardVisibleFieldDefinitionsComponentSelector';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState';
import { extractComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/extractComponentReadOnlySelector';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useRecordBoardStates = (recordBoardId?: string) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordBoardScopeInternalContext,
    getScopeIdOrUndefinedFromComponentId(recordBoardId),
  );

  return {
    scopeId,
    objectSingularNameState: extractComponentState(
      recordBoardObjectSingularNameComponentState,
      scopeId,
    ),
    kanbanFieldMetadataNameState: extractComponentState(
      recordBoardKanbanFieldMetadataNameComponentState,
      scopeId,
    ),
    isFetchingRecordState: extractComponentState(
      isRecordBoardFetchingRecordsComponentState,
      scopeId,
    ),
    isFetchingRecordsByColumnState: extractComponentFamilyState(
      isRecordBoardFetchingRecordsByColumnFamilyState,
      scopeId,
    ),
    columnIdsState: extractComponentState(
      recordBoardColumnIdsComponentState,
      scopeId,
    ),
    isFirstColumnFamilyState: extractComponentFamilyState(
      isFirstRecordBoardColumnComponentFamilyState,
      scopeId,
    ),
    isLastColumnFamilyState: extractComponentFamilyState(
      isLastRecordBoardColumnComponentFamilyState,
      scopeId,
    ),
    columnsFamilySelector: extractComponentFamilyState(
      recordBoardColumnsComponentFamilySelector,
      scopeId,
    ),

    filtersState: extractComponentState(
      recordBoardFiltersComponentState,
      scopeId,
    ),
    sortsState: extractComponentState(recordBoardSortsComponentState, scopeId),
    fieldDefinitionsState: extractComponentState(
      recordBoardFieldDefinitionsComponentState,
      scopeId,
    ),
    visibleFieldDefinitionsState: extractComponentReadOnlySelector(
      recordBoardVisibleFieldDefinitionsComponentSelector,
      scopeId,
    ),

    recordIdsByColumnIdFamilyState: extractComponentFamilyState(
      recordBoardRecordIdsByColumnIdComponentFamilyState,
      scopeId,
    ),
    isRecordBoardCardSelectedFamilyState: extractComponentFamilyState(
      isRecordBoardCardSelectedComponentFamilyState,
      scopeId,
    ),
    selectedRecordIdsSelector: extractComponentReadOnlySelector(
      recordBoardSelectedRecordIdsComponentSelector,
      scopeId,
    ),

    isCompactModeActiveState: extractComponentState(
      isRecordBoardCompactModeActiveComponentState,
      scopeId,
    ),

    shouldFetchMoreInColumnFamilyState: extractComponentFamilyState(
      recordBoardShouldFetchMoreInColumnComponentFamilyState,
      scopeId,
    ),
    shouldFetchMoreSelector: extractComponentReadOnlySelector(
      recordBoardShouldFetchMoreComponentSelector,
      scopeId,
    ),
  };
};
