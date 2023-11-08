import { RecordTableScopeInternalContext } from '@/ui/object/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { getRecordTableScopedStates } from '../../utils/getViewScopedStates';

export const useRecordTableScopedStates = (args?: {
  customRecordTableScopeId?: string;
}) => {
  const { customRecordTableScopeId } = args ?? {};

  const scopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    customRecordTableScopeId,
  );

  const { availableTableColumnsState, tableFiltersState, tableSortsState } =
    getRecordTableScopedStates({
      recordTableScopeId: scopeId,
    });

  return {
    scopeId,
    availableTableColumnsState,
    tableFiltersState,
    tableSortsState,
  };
};
