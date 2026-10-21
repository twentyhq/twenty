import { useCallback } from 'react';
import { useStore } from 'jotai';

import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import {
  NO_RECORD_GROUP_FAMILY_KEY,
  recordIndexAllRecordIdsComponentSelector,
} from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useUnfocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useUnfocusRecordTableCell';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

type useSetRecordTableDataProps = {
  recordTableId?: string;
};

export const useSetRecordTableData = ({
  recordTableId,
}: useSetRecordTableDataProps) => {
  const recordIndexRecordIdsByGroupFamilyState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const recordIndexAllRecordIdsSelector = useAtomComponentSelectorCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const isRowSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
    recordTableId,
  );

  const hasUserSelectedAllRecords = useAtomComponentStateCallbackState(
    hasUserSelectedAllRecordsComponentState,
    recordTableId,
  );

  const setRecordTableHoverPosition = useSetAtomComponentState(
    recordTableHoverPositionComponentState,
    recordTableId,
  );

  const { unfocusRecordTableCell } = useUnfocusRecordTableCell(recordTableId);
  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordTableId);
  const store = useStore();

  return useCallback(
    <T extends ObjectRecord>({
      records,
      currentRecordGroupId,
    }: {
      records: T[];
      currentRecordGroupId?: string;
    }) => {
      for (const record of records) {
        const currentRecord = store.get(
          recordStoreFamilyState.atomFamily(record.id),
        );

        if (JSON.stringify(currentRecord) !== JSON.stringify(record)) {
          const newRecord = {
            ...(currentRecord ?? {}),
            ...record,
          } as T;

          store.set(recordStoreFamilyState.atomFamily(record.id), newRecord);
        }
      }

      const currentRowIds = currentRecordGroupId
        ? store.get(
            recordIndexRecordIdsByGroupFamilyState(currentRecordGroupId),
          )
        : store.get(recordIndexAllRecordIdsSelector);

      const isAllRowsSelected = store.get(hasUserSelectedAllRecords);

      const recordIds = records.map((record) => record.id);

      if (!fastDeepEqual(currentRowIds, recordIds)) {
        unfocusRecordTableCell();
        unfocusRecordTableRow();
        setRecordTableHoverPosition(null);

        if (isAllRowsSelected) {
          for (const rowId of recordIds) {
            store.set(isRowSelectedFamilyState(rowId), true);
          }
        }

        if (isDefined(currentRecordGroupId)) {
          store.set(
            recordIndexRecordIdsByGroupFamilyState(currentRecordGroupId),
            recordIds,
          );
        } else {
          store.set(
            recordIndexRecordIdsByGroupFamilyState(NO_RECORD_GROUP_FAMILY_KEY),
            recordIds,
          );
        }
      }
    },
    [
      recordIndexRecordIdsByGroupFamilyState,
      recordIndexAllRecordIdsSelector,
      hasUserSelectedAllRecords,
      unfocusRecordTableCell,
      unfocusRecordTableRow,
      setRecordTableHoverPosition,
      isRowSelectedFamilyState,
      store,
    ],
  );
};
