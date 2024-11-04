import { useRecoilCallback } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { numberOfTableRowsComponentState } from '@/object-record/record-table/states/numberOfTableRowsComponentState';
import { tableRowIdsComponentState } from '@/object-record/record-table/states/tableRowIdsComponentState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type useSetRecordTableDataProps = {
  recordTableId?: string;
  onEntityCountChange: (entityCount?: number) => void;
};

export const useSetRecordTableData = ({
  recordTableId,
  onEntityCountChange,
}: useSetRecordTableDataProps) => {
  const tableRowIdsState = useRecoilComponentCallbackStateV2(
    tableRowIdsComponentState,
    recordTableId,
  );
  const numberOfTableRowsState = useRecoilComponentCallbackStateV2(
    numberOfTableRowsComponentState,
    recordTableId,
  );
  const isRowSelectedFamilyState = useRecoilComponentCallbackStateV2(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );
  const hasUserSelectedAllRowsState = useRecoilComponentCallbackStateV2(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends ObjectRecord>(newRecords: T[], totalCount?: number) => {
        for (const record of newRecords) {
          // TODO: refactor with scoped state later
          const currentRecord = snapshot
            .getLoadable(recordStoreFamilyState(record.id))
            .getValue();

          if (JSON.stringify(currentRecord) !== JSON.stringify(record)) {
            set(recordStoreFamilyState(record.id), record);
          }
        }

        const currentRowIds = getSnapshotValue(snapshot, tableRowIdsState);

        const hasUserSelectedAllRows = getSnapshotValue(
          snapshot,
          hasUserSelectedAllRowsState,
        );

        const recordIds = newRecords.map((record) => record.id);

        if (!isDeeplyEqual(currentRowIds, recordIds)) {
          if (hasUserSelectedAllRows) {
            for (const rowId of recordIds) {
              set(isRowSelectedFamilyState(rowId), true);
            }
          }

          set(tableRowIdsState, recordIds);
          set(numberOfTableRowsState, totalCount ?? 0);
          onEntityCountChange(totalCount);
        }
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
