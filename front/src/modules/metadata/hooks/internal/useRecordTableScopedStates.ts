import { RecordTableScopeInternalContext } from '@/ui/object/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { availableTableColumnsScopedState } from '@/ui/object/record-table/states/availableTableColumnsScopedState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getScopedState } from '@/ui/utilities/recoil-scope/utils/getScopedState';

export const useRecordTableScopedStates = (args?: {
  customRecordTableScopeId?: string;
}) => {
  const { customRecordTableScopeId } = args ?? {};

  const scopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    customRecordTableScopeId,
  );

  const availableTableColumnsState = getScopedState(
    availableTableColumnsScopedState,
    scopeId,
  );

  return {
    scopeId,
    availableTableColumnsState,
  };
};
