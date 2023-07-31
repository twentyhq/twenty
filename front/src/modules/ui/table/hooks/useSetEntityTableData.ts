import { useRecoilCallback } from 'recoil';

import { availableFiltersScopedState } from '@/ui/filter-n-sort/states/availableFiltersScopedState';
import { FilterDefinition } from '@/ui/filter-n-sort/types/FilterDefinition';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { entityTableDimensionsState } from '@/ui/table/states/entityTableDimensionsState';
import { isFetchingEntityTableDataState } from '@/ui/table/states/isFetchingEntityTableDataState';
import { TableContext } from '@/ui/table/states/TableContext';
import { tableEntitiesFamilyState } from '@/ui/table/states/tableEntitiesFamilyState';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import { viewFieldsFamilyState } from '@/ui/table/states/viewFieldsState';
import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/table/types/ViewField';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';

export function useSetEntityTableData() {
  const resetTableRowSelection = useResetTableRowSelection();

  const tableContextScopeId = useContextScopeId(TableContext);

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string }>(
        newEntityArray: T[],
        viewFields: ViewFieldDefinition<ViewFieldMetadata>[],
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

        set(entityTableDimensionsState, {
          numberOfColumns: viewFields.length,
          numberOfRows: entityIds.length,
        });

        set(availableFiltersScopedState(tableContextScopeId), filters);

        set(viewFieldsFamilyState, viewFields);

        set(isFetchingEntityTableDataState, false);
      },
    [],
  );
}
