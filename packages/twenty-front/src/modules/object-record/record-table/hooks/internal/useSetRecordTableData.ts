import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type useSetRecordTableDataProps = {
  recordTableScopeId: string;
  onEntityCountChange: (entityCount: number) => void;
};

export const useSetRecordTableData = ({
  recordTableScopeId,
  onEntityCountChange,
}: useSetRecordTableDataProps) => {
  const resetTableRowSelection = useResetTableRowSelection(recordTableScopeId);

  const { tableRowIdsState, numberOfTableRowsState } =
    useRecordTableStates(recordTableScopeId);

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string }>(newEntityArray: T[]) => {
        for (const entity of newEntityArray) {
          // TODO: refactor with scoped state later
          const currentEntity = snapshot
            .getLoadable(entityFieldsFamilyState(entity.id))
            .valueOrThrow();

          if (JSON.stringify(currentEntity) !== JSON.stringify(entity)) {
            set(entityFieldsFamilyState(entity.id), entity);
          }
        }
        const currentRowIds = getSnapshotValue(snapshot, tableRowIdsState);

        const entityIds = newEntityArray.map((entity) => entity.id);

        if (!isDeeplyEqual(currentRowIds, entityIds)) {
          set(tableRowIdsState, entityIds);
        }

        resetTableRowSelection();

        set(numberOfTableRowsState, entityIds.length);
        onEntityCountChange(entityIds.length);
      },
    [
      numberOfTableRowsState,
      onEntityCountChange,
      resetTableRowSelection,
      tableRowIdsState,
    ],
  );
};
