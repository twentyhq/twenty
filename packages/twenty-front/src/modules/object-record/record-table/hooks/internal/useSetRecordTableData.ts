import { useRecoilCallback } from 'recoil';

import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSetIsRecordTableFocusActive } from '@/object-record/record-table/record-table-cell/hooks/useSetIsRecordTableFocusActive';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentFamilyCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type useSetRecordTableDataProps = {
  recordTableId?: string;
};

export const useSetRecordTableData = ({
  recordTableId,
}: useSetRecordTableDataProps) => {
  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentFamilyCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
      recordTableId,
    );

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const isRowSelectedFamilyState = useRecoilComponentFamilyCallbackStateV2(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const hasUserSelectedAllRowsState = useRecoilComponentCallbackStateV2(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  const { setIsFocusActiveForCurrentPosition } =
    useSetIsRecordTableFocusActive(recordTableId);

  const setRecordTableHoverPosition = useSetRecoilComponentStateV2(
    recordTableHoverPositionComponentState,
    recordTableId,
  );

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends ObjectRecord>({
        records,
        currentRecordGroupId,
      }: {
        records: T[];
        currentRecordGroupId?: string;
      }) => {
        for (const record of records) {
          // TODO: refactor with scoped state later
          const currentRecord = snapshot
            .getLoadable(recordStoreFamilyState(record.id))
            .getValue();

          if (JSON.stringify(currentRecord) !== JSON.stringify(record)) {
            const newRecord = {
              ...currentRecord,
              ...record,
            };

            set(recordStoreFamilyState(record.id), newRecord);
          }
        }

        const currentRowIds = getSnapshotValue(
          snapshot,
          currentRecordGroupId
            ? recordIndexRecordIdsByGroupFamilyState(currentRecordGroupId)
            : recordIndexAllRecordIdsSelector,
        );

        const hasUserSelectedAllRows = getSnapshotValue(
          snapshot,
          hasUserSelectedAllRowsState,
        );

        const recordIds = records.map((record) => record.id);

        if (!isDeeplyEqual(currentRowIds, recordIds)) {
          setIsFocusActiveForCurrentPosition(false);
          setRecordTableHoverPosition(null);

          if (hasUserSelectedAllRows) {
            for (const rowId of recordIds) {
              set(isRowSelectedFamilyState(rowId), true);
            }
          }

          if (isDefined(currentRecordGroupId)) {
            set(
              recordIndexRecordIdsByGroupFamilyState(currentRecordGroupId),
              recordIds,
            );
          } else {
            set(recordIndexAllRecordIdsSelector, recordIds);
          }
        }
      },
    [
      recordIndexRecordIdsByGroupFamilyState,
      recordIndexAllRecordIdsSelector,
      hasUserSelectedAllRowsState,
      setIsFocusActiveForCurrentPosition,
      setRecordTableHoverPosition,
      isRowSelectedFamilyState,
    ],
  );
};
