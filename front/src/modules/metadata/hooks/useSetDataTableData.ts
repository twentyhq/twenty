import { useRecoilCallback } from 'recoil';

import { useResetTableRowSelection } from '@/ui/data/data-table/hooks/useResetTableRowSelection';
import { isFetchingDataTableDataState } from '@/ui/data/data-table/states/isFetchingDataTableDataState';
import { numberOfTableRowsState } from '@/ui/data/data-table/states/numberOfTableRowsState';
import { tableRowIdsState } from '@/ui/data/data-table/states/tableRowIdsState';
import { entityFieldsFamilyState } from '@/ui/data/field/states/entityFieldsFamilyState';
import { useView } from '@/views/hooks/useView';

export const useSetObjectDataTableData = () => {
  const resetTableRowSelection = useResetTableRowSelection();
  const { setEntityCountInCurrentView } = useView();

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string }>(newEntityArray: T[]) => {
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

        set(isFetchingDataTableDataState, false);
      },
    [resetTableRowSelection, setEntityCountInCurrentView],
  );
};
