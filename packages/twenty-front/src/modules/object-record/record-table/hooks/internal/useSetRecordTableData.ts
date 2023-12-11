import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { isFetchingRecordTableDataState } from '@/object-record/record-table/states/isFetchingRecordTableDataState';
import { numberOfTableRowsState } from '@/object-record/record-table/states/numberOfTableRowsState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { tableRowIdsState } from '../../states/tableRowIdsState';

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
        const currentRowIds = snapshot.getLoadable(tableRowIdsState).getValue();

        const entityIds = newEntityArray.map((entity) => entity.id);

        if (!isDeeplyEqual(currentRowIds, entityIds)) {
          set(tableRowIdsState, entityIds);
        }

        resetTableRowSelection();

        set(numberOfTableRowsState, entityIds.length);
        onEntityCountChange(entityIds.length);
        set(isFetchingRecordTableDataState, false);
      },
    [onEntityCountChange, resetTableRowSelection],
  );
};
