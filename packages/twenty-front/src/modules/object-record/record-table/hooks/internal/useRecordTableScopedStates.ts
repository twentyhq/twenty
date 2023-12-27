import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useScopedState } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useScopedState';

export const useRecordTableScopedStates = (recordTableId?: string) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    recordTableId,
  );

  const {
    getScopedState,
    getScopedFamilyState,
    getScopedSnapshotValue,
    getScopedFamilySnapshotValue,
  } = useScopedState(scopeId);

  return {
    scopeId,
    injectStateWithRecordTableScopeId: getScopedState,
    injectFamilyStateWithRecordTableScopeId: getScopedFamilyState,
    injectSnapshotValueWithRecordTableScopeId: getScopedSnapshotValue,
    injectFamilySnapshotValueWithRecordTableScopeId:
      getScopedFamilySnapshotValue,
  };
};
