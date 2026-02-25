import { useCallback } from 'react';
import { useStore } from 'jotai';

import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import {
  NO_RECORD_GROUP_FAMILY_KEY,
  recordIndexAllRecordIdsComponentSelector,
} from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilyStateV2 } from '@/object-record/record-store/states/recordStoreFamilyStateV2';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useUnfocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useUnfocusRecordTableCell';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';

import { recordIdByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const hasUserSelectedAllRows = useAtomComponentStateCallbackState(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  const isRecordTableInitialLoading = useAtomComponentStateCallbackState(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const recordIdByRealIndex = useAtomComponentStateCallbackState(
    recordIdByRealIndexComponentState,
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
          store.set(recordStoreFamilyStateV2.atomFamily(record.id), newRecord);
        }
      }

      const currentRowIds = currentRecordGroupId
        ? store.get(
            recordIndexRecordIdsByGroupFamilyState(currentRecordGroupId),
          )
        : store.get(recordIndexAllRecordIdsSelector);

      const isAllRowsSelected = store.get(hasUserSelectedAllRows);

      const recordIds = records.map((record) => record.id);

      if (!isDeeplyEqual(currentRowIds, recordIds)) {
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

        const isTableInitialLoading = store.get(isRecordTableInitialLoading);

        if (isTableInitialLoading) {
          const currentMap = store.get(recordIdByRealIndex);
          const newMap = new Map(currentMap);
          let mapChanged = false;

          for (const [realIndex, recordId] of recordIds.entries()) {
            if (recordId !== currentMap.get(realIndex)) {
              newMap.set(realIndex, recordId);
              mapChanged = true;
            }
          }

          if (mapChanged) {
            store.set(recordIdByRealIndex, newMap);
          }
        }
      }
    },
    [
      recordIndexRecordIdsByGroupFamilyState,
      recordIndexAllRecordIdsSelector,
      hasUserSelectedAllRows,
      unfocusRecordTableCell,
      unfocusRecordTableRow,
      setRecordTableHoverPosition,
      isRowSelectedFamilyState,
      recordIdByRealIndex,
      isRecordTableInitialLoading,
      store,
    ],
  );
};
