import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
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

  const { tableRowIdsScopeInjector, numberOfTableRowsScopeInjector } =
    getRecordTableScopeInjector();

  const {
    injectStateWithRecordTableScopeId,
    injectSnapshotValueWithRecordTableScopeId,
  } = useRecordTableScopedStates(recordTableScopeId);

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
        const currentRowIds = injectSnapshotValueWithRecordTableScopeId(
          snapshot,
          tableRowIdsScopeInjector,
        );

        const entityIds = newEntityArray.map((entity) => entity.id);

        const tableRowIdsState = injectStateWithRecordTableScopeId(
          tableRowIdsScopeInjector,
        );

        if (!isDeeplyEqual(currentRowIds, entityIds)) {
          set(tableRowIdsState, entityIds);
        }

        resetTableRowSelection();

        const numberOfTableRowsState = injectStateWithRecordTableScopeId(
          numberOfTableRowsScopeInjector,
        );

        set(numberOfTableRowsState, entityIds.length);
        onEntityCountChange(entityIds.length);
      },
    [
      injectSnapshotValueWithRecordTableScopeId,
      injectStateWithRecordTableScopeId,
      numberOfTableRowsScopeInjector,
      onEntityCountChange,
      resetTableRowSelection,
      tableRowIdsScopeInjector,
    ],
  );
};
