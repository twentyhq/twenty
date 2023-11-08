import { getScopedState } from '@/ui/utilities/recoil-scope/utils/getScopedState';

import { availableTableColumnsScopedState } from '../states/availableTableColumnsScopedState';
import { onColumnsChangeScopedState } from '../states/onColumnsChangeScopedState';
import { hiddenTableColumnsScopedSelector } from '../states/selectors/hiddenTableColumnsScopedSelector';
import { tableColumnsByKeyScopedSelector } from '../states/selectors/tableColumnsByKeyScopedSelector';
import { tableFiltersWhereScopedSelector } from '../states/selectors/tablefiltersWhereScopedSelector';
import { tableSortsOrderByScopedSelector } from '../states/selectors/tableSortsOrderByScopedSelector';
import { visibleTableColumnsScopedSelector } from '../states/selectors/visibleTableColumnsScopedSelector';
import { tableColumnsScopedState } from '../states/tableColumnsScopedState';
import { tableFiltersScopedState } from '../states/tableFiltersScopedState';
import { tableSortsScopedState } from '../states/tableSortsScopedState';

import { onEntityCountChangeScopedState } from './../states/onEntityCountChange';

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

  const tableSortsOrderBySelector =
    tableSortsOrderByScopedSelector(recordTableScopeId);

  const tableFiltersWhereSelector =
    tableFiltersWhereScopedSelector(recordTableScopeId);

  const tableColumnsState = getScopedState(
    tableColumnsScopedState,
    recordTableScopeId,
  );

  const tableColumnsByKeySelector =
    tableColumnsByKeyScopedSelector(recordTableScopeId);

  const hiddenTableColumnsSelector =
    hiddenTableColumnsScopedSelector(recordTableScopeId);

  const visibleTableColumnsSelector =
    visibleTableColumnsScopedSelector(recordTableScopeId);

  const onColumnsChangeState = getScopedState(
    onColumnsChangeScopedState,
    recordTableScopeId,
  );

  const onEntityCountChangeState = getScopedState(
    onEntityCountChangeScopedState,
    recordTableScopeId,
  );

  return {
    availableTableColumnsState,
    tableFiltersState,
    tableSortsState,
    tableSortsOrderBySelector,
    tableFiltersWhereSelector,
    tableColumnsState,
    tableColumnsByKeySelector,
    hiddenTableColumnsSelector,
    visibleTableColumnsSelector,
    onColumnsChangeState,
    onEntityCountChangeState,
  };
};
