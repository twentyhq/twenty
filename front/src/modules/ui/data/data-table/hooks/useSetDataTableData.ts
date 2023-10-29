import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/ui/data/field/states/entityFieldsFamilyState';
import { FilterDefinition } from '@/ui/data/filter/types/FilterDefinition';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import { useView } from '@/views/hooks/useView';
import { availableSortDefinitionsScopedState } from '@/views/states/availableSortDefinitionsScopedState';

import { SortDefinition } from '../../sort/types/SortDefinition';
import { isFetchingDataTableDataState } from '../states/isFetchingDataTableDataState';
import { numberOfTableRowsState } from '../states/numberOfTableRowsState';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableRowIdsState } from '../states/tableRowIdsState';

import { useResetTableRowSelection } from './useResetTableRowSelection';

export const useSetDataTableData = () => {
  const resetTableRowSelection = useResetTableRowSelection();
  const { setEntityCountInCurrentView } = useView();

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

        setEntityCountInCurrentView(entityIds.length);

        set(
          availableSortDefinitionsScopedState({ scopeId: tableContextScopeId }),
          sortDefinitionArray,
        );

        set(isFetchingDataTableDataState, false);
      },
    [resetTableRowSelection, setEntityCountInCurrentView, tableContextScopeId],
  );
};
