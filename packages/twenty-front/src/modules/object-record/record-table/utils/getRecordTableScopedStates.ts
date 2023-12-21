import { objectMetadataConfigScopedState } from '@/object-record/record-table/states/objectMetadataConfigScopedState';
import { tableLastRowVisibleScopedState } from '@/object-record/record-table/states/tableLastRowVisibleScopedState';
import { getScopedStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedStateDeprecated';

import { availableTableColumnsScopedState } from '../states/availableTableColumnsScopedState';
import { onColumnsChangeScopedState } from '../states/onColumnsChangeScopedState';
import { onEntityCountChangeScopedState } from '../states/onEntityCountChange';
import { hiddenTableColumnsScopedSelector } from '../states/selectors/hiddenTableColumnsScopedSelector';
import { tableColumnsByKeyScopedSelector } from '../states/selectors/tableColumnsByKeyScopedSelector';
import { visibleTableColumnsScopedSelector } from '../states/selectors/visibleTableColumnsScopedSelector';
import { tableColumnsScopedState } from '../states/tableColumnsScopedState';
import { tableFiltersScopedState } from '../states/tableFiltersScopedState';
import { tableSortsScopedState } from '../states/tableSortsScopedState';

export const getRecordTableScopedStates = ({
  recordTableScopeId,
}: {
  recordTableScopeId: string;
}) => {
  const availableTableColumnsState = getScopedStateDeprecated(
    availableTableColumnsScopedState,
    recordTableScopeId,
  );

  const tableFiltersState = getScopedStateDeprecated(
    tableFiltersScopedState,
    recordTableScopeId,
  );

  const tableSortsState = getScopedStateDeprecated(
    tableSortsScopedState,
    recordTableScopeId,
  );

  const tableColumnsState = getScopedStateDeprecated(
    tableColumnsScopedState,
    recordTableScopeId,
  );

  const objectMetadataConfigState = getScopedStateDeprecated(
    objectMetadataConfigScopedState,
    recordTableScopeId,
  );

  const tableColumnsByKeySelector =
    tableColumnsByKeyScopedSelector(recordTableScopeId);

  const hiddenTableColumnsSelector =
    hiddenTableColumnsScopedSelector(recordTableScopeId);

  const visibleTableColumnsSelector =
    visibleTableColumnsScopedSelector(recordTableScopeId);

  const onColumnsChangeState = getScopedStateDeprecated(
    onColumnsChangeScopedState,
    recordTableScopeId,
  );

  const onEntityCountChangeState = getScopedStateDeprecated(
    onEntityCountChangeScopedState,
    recordTableScopeId,
  );

  const tableLastRowVisibleState = getScopedStateDeprecated(
    tableLastRowVisibleScopedState,
    recordTableScopeId,
  );

  return {
    availableTableColumnsState,
    tableFiltersState,
    tableSortsState,
    tableColumnsState,
    objectMetadataConfigState,
    tableColumnsByKeySelector,
    hiddenTableColumnsSelector,
    visibleTableColumnsSelector,
    onColumnsChangeState,
    onEntityCountChangeState,
    tableLastRowVisibleState,
  };
};
