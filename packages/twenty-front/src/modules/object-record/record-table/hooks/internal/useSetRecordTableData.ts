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
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type useSetRecordTableDataProps = {
  recordTableId?: string;
};

export const useSetRecordTableData = ({
  recordTableId,
}: useSetRecordTableDataProps) => {
  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentFamilyStateCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const recordIndexAllRecordIdsSelector =
    useRecoilComponentSelectorCallbackStateV2(
      recordIndexAllRecordIdsComponentSelector,
      recordTableId,
    );

  const isRowSelectedFamilyState = useRecoilComponentFamilyStateCallbackStateV2(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const hasUserSelectedAllRowsAtom = useRecoilComponentStateCallbackStateV2(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  const isRecordTableInitialLoadingAtom =
    useRecoilComponentStateCallbackStateV2(
      isRecordTableInitialLoadingComponentState,
      recordTableId,
    );

  const recordIdByRealIndexAtom = useRecoilComponentStateCallbackStateV2(
    recordIdByRealIndexComponentState,
    recordTableId,
  );

  const setRecordTableHoverPosition = useSetRecoilComponentStateV2(
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
        ) as ObjectRecord | null | undefined;

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
        ? (store.get(
            recordIndexRecordIdsByGroupFamilyState(currentRecordGroupId),
          ) as string[])
        : (store.get(recordIndexAllRecordIdsSelector) as string[]);

      const hasUserSelectedAllRows = store.get(hasUserSelectedAllRowsAtom);

      const recordIds = records.map((record) => record.id);

      if (!isDeeplyEqual(currentRowIds, recordIds)) {
        unfocusRecordTableCell();
        unfocusRecordTableRow();
        setRecordTableHoverPosition(null);

        if (hasUserSelectedAllRows) {
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

        const isTableInitialLoading = store.get(
          isRecordTableInitialLoadingAtom,
        );

        if (isTableInitialLoading) {
          const currentMap = store.get(recordIdByRealIndexAtom);
          const newMap = new Map(currentMap);
          let mapChanged = false;

          for (const [realIndex, recordId] of recordIds.entries()) {
            if (recordId !== currentMap.get(realIndex)) {
              newMap.set(realIndex, recordId);
              mapChanged = true;
            }
          }

          if (mapChanged) {
            store.set(recordIdByRealIndexAtom, newMap);
          }
        }
      }
    },
    [
      recordIndexRecordIdsByGroupFamilyState,
      recordIndexAllRecordIdsSelector,
      hasUserSelectedAllRowsAtom,
      unfocusRecordTableCell,
      unfocusRecordTableRow,
      setRecordTableHoverPosition,
      isRowSelectedFamilyState,
      recordIdByRealIndexAtom,
      isRecordTableInitialLoadingAtom,
      store,
    ],
  );
};
