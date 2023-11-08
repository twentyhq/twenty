import { getScopedState } from '@/ui/utilities/recoil-scope/utils/getScopedState';

import { availableTableColumnsScopedState } from '../states/availableTableColumnsScopedState';
import { tableFiltersScopedState } from '../states/tableFiltersScopedState';
import { tableSortsScopedState } from '../states/tableSortsScopedState';

export const getRecordTableScopedStates = ({
  recordTableScopeId,
}: {
  recordTableScopeId: string;
}) => {
  const availableTableColumnsState = getScopedState(
    availableTableColumnsScopedState,
    recordTableScopeId,
  );

  const tableFiltersState = getScopedState(
    tableFiltersScopedState,
    recordTableScopeId,
  );

  const tableSortsState = getScopedState(
    tableSortsScopedState,
    recordTableScopeId,
  );

  return {
    availableTableColumnsState,
    tableFiltersState,
    tableSortsState,
  };
};
