import { useRecoilCallback } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type useSetRecordTableDataProps = {
  recordTableId?: string;
  onEntityCountChange: (entityCount: number) => void;
};

export const useSetRecordTableData = ({
  recordTableId,
  onEntityCountChange,
}: useSetRecordTableDataProps) => {
  const { getTableRowIdsState, getNumberOfTableRowsState } =
    useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string }>(newEntityArray: T[], totalCount: number) => {
        for (const entity of newEntityArray) {
          // TODO: refactor with scoped state later
          const currentEntity = snapshot
            .getLoadable(recordStoreFamilyState(entity.id))
            .valueOrThrow();

          if (JSON.stringify(currentEntity) !== JSON.stringify(entity)) {
            set(recordStoreFamilyState(entity.id), entity);
          }
        }
        const currentRowIds = getSnapshotValue(snapshot, getTableRowIdsState());

        const entityIds = newEntityArray.map((entity) => entity.id);

        if (!isDeeplyEqual(currentRowIds, entityIds)) {
          set(getTableRowIdsState(), entityIds);
        }

        set(getNumberOfTableRowsState(), totalCount);
        onEntityCountChange(totalCount);
      },
    [getNumberOfTableRowsState, getTableRowIdsState, onEntityCountChange],
  );
};
