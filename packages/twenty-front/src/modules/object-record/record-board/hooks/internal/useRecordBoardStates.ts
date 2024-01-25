import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { isRecordBoardColumnFirstFamilyStateScopeMap } from '@/object-record/record-board/states/isRecordBoardColumnFirstFamilyStateScopeMap';
import { recordBoardColumnIdsStateScopeMap } from '@/object-record/record-board/states/recordBoardColumnIdsStateScopeMap';
import { recordBoardColumnsFamilySelectorScopeMap } from '@/object-record/record-board/states/selectors/recordBoardColumnsFamilySelectorScopeMap';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getFamilyState } from '@/ui/utilities/recoil-scope/utils/getFamilyState';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { getState } from '@/ui/utilities/recoil-scope/utils/getState';

export const useRecordBoardStates = (recordBoardId?: string) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordBoardScopeInternalContext,
    getScopeIdFromComponentId(recordBoardId),
  );

  return {
    scopeId,
    getColumnIdsState: getState(recordBoardColumnIdsStateScopeMap, scopeId),
    isColumnLastFamilyState: getFamilyState(
      isRecordBoardColumnFirstFamilyStateScopeMap,
      scopeId,
    ),
    isColumnFirstFamilyState: getFamilyState(
      isRecordBoardColumnFirstFamilyStateScopeMap,
      scopeId,
    ),
    columnsFamilySelector: getFamilyState(
      recordBoardColumnsFamilySelectorScopeMap,
      scopeId,
    ),
  };
};
