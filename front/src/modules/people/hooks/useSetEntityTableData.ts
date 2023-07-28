import { useRecoilCallback } from 'recoil';

import { FilterDefinition } from '@/ui/filter-n-sort/types/FilterDefinition';
import { entityFieldMetadataArrayState } from '@/ui/table/states/entityFieldMetadataArrayState';
import { tableEntitiesFamilyState } from '@/ui/table/states/tableEntitiesFamilyState';
import { EntityFieldMetadata } from '@/ui/table/types/EntityFieldMetadata';

import { availableFiltersScopedState } from '../../ui/filter-n-sort/states/availableFiltersScopedState';
import { useContextScopeId } from '../../ui/recoil-scope/hooks/useContextScopeId';
import { useResetTableRowSelection } from '../../ui/table/hooks/useResetTableRowSelection';
import { entityTableDimensionsState } from '../../ui/table/states/entityTableDimensionsState';
import { isFetchingEntityTableDataState } from '../../ui/table/states/isFetchingEntityTableDataState';
import { TableContext } from '../../ui/table/states/TableContext';
import { tableRowIdsState } from '../../ui/table/states/tableRowIdsState';

export function useSetEntityTableData() {
  const resetTableRowSelection = useResetTableRowSelection();

  const tableContextScopeId = useContextScopeId(TableContext);

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string }>(
        newEntityArray: T[],
        entityFieldMetadataArray: EntityFieldMetadata[],
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
          numberOfColumns: entityFieldMetadataArray.length,
          numberOfRows: entityIds.length,
        });

        const filters = entityFieldMetadataArray.map(
          (fieldMetadata) =>
            ({
              field: fieldMetadata.fieldName,
              icon: fieldMetadata.filterIcon,
              label: fieldMetadata.label,
              type: fieldMetadata.type,
            } as FilterDefinition),
        );

        set(availableFiltersScopedState(tableContextScopeId), filters);

        set(entityFieldMetadataArrayState, entityFieldMetadataArray);

        set(isFetchingEntityTableDataState, false);
      },
    [],
  );
}
