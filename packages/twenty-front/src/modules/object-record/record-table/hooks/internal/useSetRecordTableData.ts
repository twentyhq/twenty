import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { numberOfTableRowsScopedState } from '@/object-record/record-table/states/numberOfTableRowsScopedState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { tableRowIdsScopedState } from '../../states/tableRowIdsScopedState';

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
        const currentRowIds = snapshot
          .getLoadable(tableRowIdsScopedState)
          .getValue();

        const entityIds = newEntityArray.map((entity) => entity.id);

        if (!isDeeplyEqual(currentRowIds, entityIds)) {
          set(tableRowIdsScopedState, entityIds);
        }

        resetTableRowSelection();

        set(numberOfTableRowsScopedState, entityIds.length);
        onEntityCountChange(entityIds.length);
      },
    [onEntityCountChange, resetTableRowSelection],
  );
};
