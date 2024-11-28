import { useRecoilCallback } from 'recoil';

import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { recordIndexAllRowIdsComponentState } from '@/object-record/record-index/states/recordIndexAllRowIdsComponentState';
import { recordIndexRowIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRowIdsByGroupComponentFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
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
  const recordIndexRowIdsByGroupFamilyState = useRecoilComponentCallbackStateV2(
    recordIndexRowIdsByGroupComponentFamilyState,
    recordTableId,
  );
  const recordIndexAllRowIdsState = useRecoilComponentCallbackStateV2(
    recordIndexAllRowIdsComponentState,
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
  const recordIndexRecordGroupIdsState = useRecoilComponentCallbackStateV2(
    recordGroupIdsComponentState,
    recordTableId,
  );

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends ObjectRecord>({
        records,
        currentRecordGroupId,
        totalCount,
      }: {
        records: T[];
        currentRecordGroupId?: string;
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
          currentRecordGroupId
            ? recordIndexRowIdsByGroupFamilyState(currentRecordGroupId)
            : recordIndexAllRowIdsState,
        );

        const hasUserSelectedAllRows = getSnapshotValue(
          snapshot,
          hasUserSelectedAllRowsState,
        );

        const recordGroupIds = getSnapshotValue(
          snapshot,
          recordIndexRecordGroupIdsState,
        );

        const recordIds = records.map((record) => record.id);

        if (!isDeeplyEqual(currentRowIds, recordIds)) {
          if (hasUserSelectedAllRows) {
            for (const rowId of recordIds) {
              set(isRowSelectedFamilyState(rowId), true);
            }
          }

          if (isDefined(currentRecordGroupId)) {
            // TODO: Hack to store all ids in the same order as the record group definitions
            // Should be replaced by something more efficient
            const allRowIds: string[] = [];

            set(
              recordIndexRowIdsByGroupFamilyState(currentRecordGroupId),
              recordIds,
            );

            for (const recordGroupId of recordGroupIds) {
              const tableRowIdsByGroup =
                recordGroupId !== currentRecordGroupId
                  ? getSnapshotValue(
                      snapshot,
                      recordIndexRowIdsByGroupFamilyState(recordGroupId),
                    )
                  : recordIds;

              allRowIds.push(...tableRowIdsByGroup);
            }
            set(recordIndexAllRowIdsState, allRowIds);
          } else {
            set(recordIndexAllRowIdsState, recordIds);
          }

          onEntityCountChange(totalCount);
        }
      },
    [
      recordIndexRowIdsByGroupFamilyState,
      recordIndexAllRowIdsState,
      hasUserSelectedAllRowsState,
      recordIndexRecordGroupIdsState,
      onEntityCountChange,
      isRowSelectedFamilyState,
    ],
  );
};
