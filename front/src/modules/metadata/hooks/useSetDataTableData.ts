import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/ui/object/field/states/entityFieldsFamilyState';
import { useResetTableRowSelection } from '@/ui/object/record-table/hooks/useResetTableRowSelection';
import { isFetchingRecordTableDataState } from '@/ui/object/record-table/states/isFetchingRecordTableDataState';
import { numberOfTableRowsState } from '@/ui/object/record-table/states/numberOfTableRowsState';
import { tableRowIdsState } from '@/ui/object/record-table/states/tableRowIdsState';
import { useView } from '@/views/hooks/useView';

export const useSetObjectRecordTableData = () => {
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

        set(isFetchingRecordTableDataState, false);
      },
    [resetTableRowSelection, setEntityCountInCurrentView],
  );
};
