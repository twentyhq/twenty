import { useRecoilCallback } from 'recoil';

import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { tableAllRowIdsComponentState } from '@/object-record/record-table/states/tableAllRowIdsComponentState';
import { tableRowIdsByGroupComponentFamilyState } from '@/object-record/record-table/states/tableRowIdsByGroupComponentFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';

type useSetRecordTableDataProps = {
  recordTableId?: string;
  onEntityCountChange: (entityCount?: number) => void;
};

export const useSetRecordTableData = ({
  recordTableId,
  onEntityCountChange,
}: useSetRecordTableDataProps) => {
  const tableRowIdsByGroupFamilyState = useRecoilComponentCallbackStateV2(
    tableRowIdsByGroupComponentFamilyState,
    recordTableId,
  );
  const tableAllRowIdsState = useRecoilComponentCallbackStateV2(
    tableAllRowIdsComponentState,
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
  const recordGroupDefinitionsState = useRecoilComponentCallbackStateV2(
    recordGroupDefinitionsComponentState,
    recordTableId,
  );

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends ObjectRecord>({
        records,
        recordGroupId,
        totalCount,
      }: {
        records: T[];
        recordGroupId?: string;
        totalCount?: number;
      }) => {
        for (const record of records) {
          // TODO: refactor with scoped state later
          const currentRecord = snapshot
            .getLoadable(recordStoreFamilyState(record.id))
            .getValue();

          if (JSON.stringify(currentRecord) !== JSON.stringify(record)) {
            set(recordStoreFamilyState(record.id), record);
          }
        }

        const currentRowIds = getSnapshotValue(
          snapshot,
          recordGroupId
            ? tableRowIdsByGroupFamilyState(recordGroupId)
            : tableAllRowIdsState,
        );

        const hasUserSelectedAllRows = getSnapshotValue(
          snapshot,
          hasUserSelectedAllRowsState,
        );

        const recordGroupDefinitions = getSnapshotValue(
          snapshot,
          recordGroupDefinitionsState,
        );

        const recordIds = records.map((record) => record.id);

        if (!isDeeplyEqual(currentRowIds, recordIds)) {
          if (hasUserSelectedAllRows) {
            for (const rowId of recordIds) {
              set(isRowSelectedFamilyState(rowId), true);
            }
          }

          if (isDefined(recordGroupId)) {
            // TODO: Hack to store all ids in the same order as the record group definitions
            // Should be replaced by something more efficient
            const allRowIds: string[] = [];

            set(tableRowIdsByGroupFamilyState(recordGroupId), recordIds);

            for (const recordGroupDefinition of recordGroupDefinitions) {
              const tableRowIdsByGroup =
                recordGroupDefinition.id !== recordGroupId
                  ? getSnapshotValue(
                      snapshot,
                      tableRowIdsByGroupFamilyState(recordGroupDefinition.id),
                    )
                  : recordIds;

              allRowIds.push(...tableRowIdsByGroup);
            }
            set(tableAllRowIdsState, allRowIds);
          } else {
            set(tableAllRowIdsState, recordIds);
          }

          onEntityCountChange(totalCount);
        }
      },
    [
      tableRowIdsByGroupFamilyState,
      tableAllRowIdsState,
      recordGroupDefinitionsState,
      onEntityCountChange,
      isRowSelectedFamilyState,
      hasUserSelectedAllRowsState,
    ],
  );
};
