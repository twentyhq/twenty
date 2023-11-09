import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/ui/object/field/states/entityFieldsFamilyState';

import { isFetchingRecordTableDataState } from '../../states/isFetchingRecordTableDataState';
import { numberOfTableRowsState } from '../../states/numberOfTableRowsState';
import { tableRowIdsState } from '../../states/tableRowIdsState';

import { useResetTableRowSelection } from './useResetTableRowSelection';

type useSetRecordTableDataProps = {
  onEntityCountChange: (entityCount: number) => void;
};

export const useSetRecordTableData = ({
  onEntityCountChange,
}: useSetRecordTableDataProps) => {
  const resetTableRowSelection = useResetTableRowSelection();

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
        onEntityCountChange(entityIds.length);
        set(isFetchingRecordTableDataState, false);
      },
    [onEntityCountChange, resetTableRowSelection],
  );
};
