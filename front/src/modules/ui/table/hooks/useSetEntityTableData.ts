import { useRecoilCallback } from 'recoil';

import { availableFiltersScopedState } from '@/ui/filter-n-sort/states/availableFiltersScopedState';
import { FilterDefinition } from '@/ui/filter-n-sort/types/FilterDefinition';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableEntitiesFamilyState } from '@/ui/table/states/tableEntitiesFamilyState';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';

import { isFetchingEntityTableDataState } from '../states/isFetchingEntityTableDataState';
import { numberOfTableRowsState } from '../states/numberOfTableRowsState';

export function useSetEntityTableData() {
  const resetTableRowSelection = useResetTableRowSelection();

  const tableContextScopeId = useContextScopeId(TableRecoilScopeContext);

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string }>(
        newEntityArray: T[],
        filters: FilterDefinition[],
      ) => {
        for (const entity of newEntityArray) {
          const currentEntity = snapshot
            .getLoadable(tableEntitiesFamilyState(entity.id))
            .valueOrThrow();

          if (JSON.stringify(currentEntity) !== JSON.stringify(entity)) {
            set(tableEntitiesFamilyState(entity.id), entity);
          }
        }

        const entityIds = newEntityArray.map((entity) => entity.id);

        set(tableRowIdsState, (currentRowIds) => {
          if (JSON.stringify(currentRowIds) !== JSON.stringify(entityIds)) {
            return entityIds;
          }

          return currentRowIds;
        });

        resetTableRowSelection();

        set(numberOfTableRowsState, entityIds.length);

        set(availableFiltersScopedState(tableContextScopeId), filters);

        set(isFetchingEntityTableDataState, false);
      },
    [resetTableRowSelection, tableContextScopeId],
  );
}
