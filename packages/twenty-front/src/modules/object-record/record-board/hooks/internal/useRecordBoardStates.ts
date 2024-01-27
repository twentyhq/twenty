import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { isFirstRecordBoardColumnFamilyStateScopeMap } from '@/object-record/record-board/states/isFirstRecordBoardColumnFamilyStateScopeMap';
import { isLastRecordBoardColumnFamilyStateScopeMap } from '@/object-record/record-board/states/isLastRecordBoardColumnFamilyStateScopeMap';
import { recordBoardColumnIdsStateScopeMap } from '@/object-record/record-board/states/recordBoardColumnIdsStateScopeMap';
import { recordBoardFieldDefinitionsStateScopeMap } from '@/object-record/record-board/states/recordBoardFieldDefinitionsStateScopeMap';
import { recordBoardFiltersStateScopeMap } from '@/object-record/record-board/states/recordBoardFiltersStateScopeMap';
import { recordBoardObjectMetadataSingularNameStateScopeMap } from '@/object-record/record-board/states/recordBoardObjectMetadataSingularNameStateScopeMap';
import { recordBoardRecordIdsByColumnIdFamilyStateScopeMap } from '@/object-record/record-board/states/recordBoardRecordIdsByColumnIdFamilyStateScopeMap';
import { recordBoardSortsStateScopeMap } from '@/object-record/record-board/states/recordBoardSortsStateScopeMap';
import { recordBoardColumnsFamilySelectorScopeMap } from '@/object-record/record-board/states/selectors/recordBoardColumnsFamilySelectorScopeMap';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getFamilyState } from '@/ui/utilities/recoil-scope/utils/getFamilyState';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { getState } from '@/ui/utilities/recoil-scope/utils/getState';

export const useRecordBoardStates = (recordBoardId?: string) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordBoardScopeInternalContext,
    getScopeIdOrUndefinedFromComponentId(recordBoardId),
  );

  return {
    scopeId,
    getObjectMetadataSingularNameState: getState(
      recordBoardObjectMetadataSingularNameStateScopeMap,
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

    recordBoardRecordIdsByColumnIdFamilyState: getFamilyState(
      recordBoardRecordIdsByColumnIdFamilyStateScopeMap,
      scopeId,
    ),
  };
};
