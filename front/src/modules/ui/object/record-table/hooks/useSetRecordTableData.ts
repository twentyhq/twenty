import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/ui/object/field/states/entityFieldsFamilyState';
import { useView } from '@/views/hooks/useView';

import { isFetchingRecordTableDataState } from '../states/isFetchingRecordTableDataState';
import { numberOfTableRowsState } from '../states/numberOfTableRowsState';
import { tableRowIdsState } from '../states/tableRowIdsState';

import { useResetTableRowSelection } from './useResetTableRowSelection';

export const useSetRecordTableData = () => {
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
