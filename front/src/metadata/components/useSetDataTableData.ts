import { useRecoilCallback } from 'recoil';

import { useResetTableRowSelection } from '@/ui/data-table/hooks/useResetTableRowSelection';
import { isFetchingDataTableDataState } from '@/ui/data-table/states/isFetchingDataTableDataState';
import { numberOfTableRowsState } from '@/ui/data-table/states/numberOfTableRowsState';
import { TableRecoilScopeContext } from '@/ui/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableRowIdsState } from '@/ui/data-table/states/tableRowIdsState';
import { entityFieldsFamilyState } from '@/ui/field/states/entityFieldsFamilyState';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import { availableFiltersScopedState } from '@/ui/view-bar/states/availableFiltersScopedState';
import { availableSortsScopedState } from '@/ui/view-bar/states/availableSortsScopedState';
import { entityCountInCurrentViewState } from '@/ui/view-bar/states/entityCountInCurrentViewState';

export const useSetObjectDataTableData = () => {
  const resetTableRowSelection = useResetTableRowSelection();

  const tableContextScopeId = useRecoilScopeId(TableRecoilScopeContext);

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { node: { id: string } }>(newEntityArrayRaw: T[]) => {
        const newEntityArray = newEntityArrayRaw.map((entity) => entity.node);

        for (const entity of newEntityArray) {
          const currentEntity = snapshot
            .getLoadable(entityFieldsFamilyState(entity.id))
            .valueOrThrow();

          if (JSON.stringify(currentEntity) !== JSON.stringify(entity)) {
            set(entityFieldsFamilyState(entity.id), entity);
          }
        }

        const entityIds = newEntityArray.map((entity) => entity.id);

        // eslint-disable-next-line no-console
        console.log({ newEntityArray, entityIds });

        set(tableRowIdsState, (currentRowIds) => {
          if (JSON.stringify(currentRowIds) !== JSON.stringify(entityIds)) {
            return entityIds;
          }

          return currentRowIds;
        });

        resetTableRowSelection();

        set(numberOfTableRowsState, entityIds.length);

        set(entityCountInCurrentViewState, entityIds.length);

        set(availableFiltersScopedState(tableContextScopeId), []);

        set(availableSortsScopedState(tableContextScopeId), []);

        set(isFetchingDataTableDataState, false);
      },
    [resetTableRowSelection, tableContextScopeId],
  );
};
