import { useRecoilCallback } from 'recoil';

import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useUnfocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useUnfocusRecordTableCell';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type useSetRecordTableDataProps = {
  recordTableId?: string;
};

export const useSetRecordTableData = ({
  recordTableId,
}: useSetRecordTableDataProps) => {
  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentFamilyCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
      recordTableId,
    );

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const isRowSelectedFamilyState = useRecoilComponentFamilyCallbackState(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const hasUserSelectedAllRowsState = useRecoilComponentCallbackState(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  const isRecordTableInitialLoadingCallbackState =
    useRecoilComponentCallbackState(
      isRecordTableInitialLoadingComponentState,
      recordTableId,
    );

  const recordIdByRealIndexCallbackState =
    useRecoilComponentFamilyCallbackState(
      recordIdByRealIndexComponentFamilyState,
      recordTableId,
    );

  const setRecordTableHoverPosition = useSetRecoilComponentState(
    recordTableHoverPositionComponentState,
    recordTableId,
  );

  const { unfocusRecordTableCell } = useUnfocusRecordTableCell(recordTableId);
  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

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
          unfocusRecordTableCell();
          unfocusRecordTableRow();
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

          const isTableInitialLoading = getSnapshotValue(
            snapshot,
            isRecordTableInitialLoadingCallbackState,
          );

          if (isTableInitialLoading) {
            for (const [realIndex, recordId] of recordIds.entries()) {
              const currentRecordIdAtRealIndex = getSnapshotValue(
                snapshot,
                recordIdByRealIndexCallbackState({ realIndex }),
              );

              if (recordId !== currentRecordIdAtRealIndex) {
                set(recordIdByRealIndexCallbackState({ realIndex }), recordId);
              }
            }
          }
        }
      },
    [
      recordIndexRecordIdsByGroupFamilyState,
      recordIndexAllRecordIdsSelector,
      hasUserSelectedAllRowsState,
      unfocusRecordTableCell,
      unfocusRecordTableRow,
      setRecordTableHoverPosition,
      isRowSelectedFamilyState,
      recordIdByRealIndexCallbackState,
      isRecordTableInitialLoadingCallbackState,
    ],
  );
};
