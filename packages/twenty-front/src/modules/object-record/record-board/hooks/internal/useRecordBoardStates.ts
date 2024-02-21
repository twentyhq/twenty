import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { isFirstRecordBoardColumnFamilyStateScopeMap } from '@/object-record/record-board/states/isFirstRecordBoardColumnFamilyStateScopeMap';
import { isLastRecordBoardColumnFamilyStateScopeMap } from '@/object-record/record-board/states/isLastRecordBoardColumnFamilyStateScopeMap';
import { isRecordBoardCardSelectedFamilyStateScopeMap } from '@/object-record/record-board/states/isRecordBoardCardSelectedFamilyStateScopeMap';
import { isRecordBoardCompactModeActiveStateScopeMap } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveStateScopeMap';
import { isRecordBoardFetchingRecordsStateScopeMap } from '@/object-record/record-board/states/isRecordBoardFetchingRecordsStateScopeMap';
import { onRecordBoardFetchMoreVisibilityChangeStateScopeMap } from '@/object-record/record-board/states/onRecordBoardFetchMoreVisibilityChangeStateScopeMap';
import { recordBoardColumnIdsStateScopeMap } from '@/object-record/record-board/states/recordBoardColumnIdsStateScopeMap';
import { recordBoardFieldDefinitionsStateScopeMap } from '@/object-record/record-board/states/recordBoardFieldDefinitionsStateScopeMap';
import { recordBoardFiltersStateScopeMap } from '@/object-record/record-board/states/recordBoardFiltersStateScopeMap';
import { recordBoardObjectSingularNameStateScopeMap } from '@/object-record/record-board/states/recordBoardObjectSingularNameStateScopeMap';
import { recordBoardRecordIdsByColumnIdFamilyStateScopeMap } from '@/object-record/record-board/states/recordBoardRecordIdsByColumnIdFamilyStateScopeMap';
import { recordBoardSortsStateScopeMap } from '@/object-record/record-board/states/recordBoardSortsStateScopeMap';
import { recordBoardColumnsFamilySelectorScopeMap } from '@/object-record/record-board/states/selectors/recordBoardColumnsFamilySelectorScopeMap';
import { recordBoardSelectedRecordIdsSelectorScopeMap } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsSelectorScopeMap';
import { recordBoardVisibleFieldDefinitionsScopedSelector } from '@/object-record/record-board/states/selectors/recordBoardVisibleFieldDefinitionsScopedSelector';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getFamilyState } from '@/ui/utilities/recoil-scope/utils/getFamilyState';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { getSelectorReadOnly } from '@/ui/utilities/recoil-scope/utils/getSelectorReadOnly';
import { getState } from '@/ui/utilities/recoil-scope/utils/getState';

export const useRecordBoardStates = (recordBoardId?: string) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordBoardScopeInternalContext,
    getScopeIdOrUndefinedFromComponentId(recordBoardId),
  );

  return {
    scopeId,
    getObjectSingularNameState: getState(
      recordBoardObjectSingularNameStateScopeMap,
      scopeId,
    ),
    getIsFetchingRecordState: getState(
      isRecordBoardFetchingRecordsStateScopeMap,
      scopeId,
    ),
    getColumnIdsState: getState(recordBoardColumnIdsStateScopeMap, scopeId),
    isFirstColumnFamilyState: getFamilyState(
      isFirstRecordBoardColumnFamilyStateScopeMap,
      scopeId,
    ),
    isLastColumnFamilyState: getFamilyState(
      isLastRecordBoardColumnFamilyStateScopeMap,
      scopeId,
    ),
    columnsFamilySelector: getFamilyState(
      recordBoardColumnsFamilySelectorScopeMap,
      scopeId,
    ),

    getFiltersState: getState(recordBoardFiltersStateScopeMap, scopeId),
    getSortsState: getState(recordBoardSortsStateScopeMap, scopeId),
    getFieldDefinitionsState: getState(
      recordBoardFieldDefinitionsStateScopeMap,
      scopeId,
    ),
    getVisibleFieldDefinitionsState: getSelectorReadOnly(
      recordBoardVisibleFieldDefinitionsScopedSelector,
      scopeId,
    ),

    recordIdsByColumnIdFamilyState: getFamilyState(
      recordBoardRecordIdsByColumnIdFamilyStateScopeMap,
      scopeId,
    ),
    isRecordBoardCardSelectedFamilyState: getFamilyState(
      isRecordBoardCardSelectedFamilyStateScopeMap,
      scopeId,
    ),
    getSelectedRecordIdsSelector: getSelectorReadOnly(
      recordBoardSelectedRecordIdsSelectorScopeMap,
      scopeId,
    ),

    getIsCompactModeActiveState: getState(
      isRecordBoardCompactModeActiveStateScopeMap,
      scopeId,
    ),

    getOnFetchMoreVisibilityChangeState: getState(
      onRecordBoardFetchMoreVisibilityChangeStateScopeMap,
      scopeId,
    ),
  };
};
