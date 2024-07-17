import { useRecoilCallback } from 'recoil';

import { CursorByRecordId } from '@/object-record/cache/utils/getCursorByRecordIdFromRecordConnection';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { cursorByRecordFamilyState } from '@/object-record/record-table/states/cursorByRecordFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type useSetRecordTableDataProps = {
  recordTableId?: string;
  onEntityCountChange: (entityCount?: number) => void;
};

export const useSetRecordTableData = ({
  recordTableId,
  onEntityCountChange,
}: useSetRecordTableDataProps) => {
  const {
    tableRowIdsState,
    numberOfTableRowsState,
    isRowSelectedFamilyState,
    hasUserSelectedAllRowsState,
  } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends ObjectRecord>(
        newRecords: T[],
        cursorsByRecordId: CursorByRecordId[],
        totalCount?: number,
      ) => {
        for (const record of newRecords) {
          // TODO: refactor with scoped state later
          const currentRecord = snapshot
            .getLoadable(recordStoreFamilyState(record.id))
            .getValue();

          if (JSON.stringify(currentRecord) !== JSON.stringify(record)) {
            set(recordStoreFamilyState(record.id), record);
            set(
              cursorByRecordFamilyState(record.id),
              cursorsByRecordId.find((cursor) => cursor.recordId === record.id)
                ?.cursor,
            );
          }
        }

        const currentRowIds = getSnapshotValue(snapshot, tableRowIdsState);

        const hasUserSelectedAllRows = getSnapshotValue(
          snapshot,
          hasUserSelectedAllRowsState,
        );

        const entityIds = newRecords.map((entity) => entity.id);

        if (!isDeeplyEqual(currentRowIds, entityIds)) {
          set(tableRowIdsState, entityIds);
        }

        if (hasUserSelectedAllRows) {
          for (const rowId of entityIds) {
            set(isRowSelectedFamilyState(rowId), true);
          }
        }

        set(numberOfTableRowsState, totalCount ?? 0);
        onEntityCountChange(totalCount);
      },
    [
      numberOfTableRowsState,
      tableRowIdsState,
      onEntityCountChange,
      isRowSelectedFamilyState,
      hasUserSelectedAllRowsState,
    ],
  );
};
