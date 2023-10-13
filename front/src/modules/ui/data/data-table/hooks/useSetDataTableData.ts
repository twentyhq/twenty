import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/ui/data/field/states/entityFieldsFamilyState';
import { availableFiltersScopedState } from '@/ui/data/view-bar/states/availableFiltersScopedState';
import { availableSortsScopedState } from '@/ui/data/view-bar/states/availableSortsScopedState';
import { entityCountInCurrentViewState } from '@/ui/data/view-bar/states/entityCountInCurrentViewState';
import { FilterDefinition } from '@/ui/data/view-bar/types/FilterDefinition';
import { SortDefinition } from '@/ui/data/view-bar/types/SortDefinition';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';

import { isFetchingDataTableDataState } from '../states/isFetchingDataTableDataState';
import { numberOfTableRowsState } from '../states/numberOfTableRowsState';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableRowIdsState } from '../states/tableRowIdsState';

import { useResetTableRowSelection } from './useResetTableRowSelection';

export const useSetDataTableData = () => {
  const resetTableRowSelection = useResetTableRowSelection();

  const tableContextScopeId = useRecoilScopeId(TableRecoilScopeContext);

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string }>(
        newEntityArray: T[],
        filterDefinitionArray: FilterDefinition[],
        sortDefinitionArray: SortDefinition[],
      ) => {
        for (const entity of newEntityArray) {
          const currentEntity = snapshot
            .getLoadable(entityFieldsFamilyState(entity.id))
            .valueOrThrow();

          if (JSON.stringify(currentEntity) !== JSON.stringify(entity)) {
            set(entityFieldsFamilyState(entity.id), entity);
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

        set(entityCountInCurrentViewState, entityIds.length);

        set(
          availableFiltersScopedState(tableContextScopeId),
          filterDefinitionArray,
        );

        set(
          availableSortsScopedState(tableContextScopeId),
          sortDefinitionArray,
        );

        set(isFetchingDataTableDataState, false);
      },
    [resetTableRowSelection, tableContextScopeId],
  );
};
