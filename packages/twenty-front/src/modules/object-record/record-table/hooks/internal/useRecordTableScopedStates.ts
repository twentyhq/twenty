import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { getRecordTableScopeInjector } from '../../utils/getRecordTableScopeInjector';

export const useRecordTableScopedStates = (args?: {
  customRecordTableScopeId?: string;
}) => {
  const { customRecordTableScopeId } = args ?? {};

  const scopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    customRecordTableScopeId,
  );

  const {
    availableTableColumnsState,
    tableFiltersState,
    tableSortsState,
    tableColumnsState,
    objectMetadataConfigState,
    tableColumnsByKeySelector,
    hiddenTableColumnsSelector,
    visibleTableColumnsSelector,
    onEntityCountChangeState,
    onColumnsChangeState,
    tableLastRowVisibleState,
  } = getRecordTableScopeInjector({
    recordTableScopeId: scopeId,
  });

  return {
    scopeId,
    availableTableColumnsState,
    tableFiltersState,
    tableSortsState,
    tableColumnsState,
    objectMetadataConfigState,
    tableColumnsByKeySelector,
    hiddenTableColumnsSelector,
    visibleTableColumnsSelector,
    onEntityCountChangeState,
    onColumnsChangeState,
    tableLastRowVisibleState,
  };
};
