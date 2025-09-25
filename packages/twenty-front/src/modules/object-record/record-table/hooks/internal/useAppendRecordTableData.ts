import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useUnfocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useUnfocusRecordTableCell';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export const useAppendRecordTableData = () => {
  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
  );

  const isRowSelectedFamilyState = useRecoilComponentFamilyCallbackState(
    isRowSelectedComponentFamilyState,
  );

  const hasUserSelectedAllRowsState = useRecoilComponentCallbackState(
    hasUserSelectedAllRowsComponentState,
  );

  const setRecordTableHoverPosition = useSetRecoilComponentState(
    recordTableHoverPositionComponentState,
  );

  const { unfocusRecordTableCell } = useUnfocusRecordTableCell();
  const { unfocusRecordTableRow } = useFocusedRecordTableRow();

  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends ObjectRecord>({ records }: { records: T[] }) => {
        const currentRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );

        const recordIdsToAppend = records.map((record) => record.id);

        const areRecordIdArraysOverlapping = currentRecordIds.some(
          (currentRecordId) => recordIdsToAppend.includes(currentRecordId),
        );

        if (areRecordIdArraysOverlapping) {
          return;
        }

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

        const hasUserSelectedAllRows = getSnapshotValue(
          snapshot,
          hasUserSelectedAllRowsState,
        );

        unfocusRecordTableCell();
        unfocusRecordTableRow();
        setRecordTableHoverPosition(null);

        const newRecordIds = currentRecordIds.concat(recordIdsToAppend);

        if (hasUserSelectedAllRows) {
          for (const rowId of newRecordIds) {
            set(isRowSelectedFamilyState(rowId), true);
          }
        }

        set(recordIndexAllRecordIdsSelector, newRecordIds);
      },
    [
      recordIndexAllRecordIdsSelector,
      hasUserSelectedAllRowsState,
      unfocusRecordTableCell,
      unfocusRecordTableRow,
      setRecordTableHoverPosition,
      isRowSelectedFamilyState,
    ],
  );
};
