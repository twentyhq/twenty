import { useCallback } from 'react';
import { useStore } from 'jotai';

import { activeRecordGroupTabIdComponentSelector } from '@/object-record/record-group/states/selectors/activeRecordGroupTabIdComponentSelector';
import { isRecordGroupTabsDisplayedComponentSelector } from '@/object-record/record-group/states/selectors/isRecordGroupTabsDisplayedComponentSelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import {
  NO_RECORD_GROUP_FAMILY_KEY,
  recordIndexAllRecordIdsComponentSelector,
} from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';

import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useGetLookupRelationRecordKeys } from '@/object-record/record-column-scope/hooks/useGetLookupRelationRecordKeys';
import { getRecordsWithLookupRelatedRecords } from '@/object-record/record-column-lookup/utils/getRecordsWithLookupRelatedRecords';
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

  const isRecordGroupTabsDisplayed = useAtomComponentSelectorCallbackState(
    isRecordGroupTabsDisplayedComponentSelector,
    recordTableId,
  );

  const activeRecordGroupTabId = useAtomComponentSelectorCallbackState(
    activeRecordGroupTabIdComponentSelector,
    recordTableId,
  );

  const setRecordTableHoverPosition = useSetAtomComponentState(
    recordTableHoverPositionComponentState,
    recordTableId,
  );

  const { unfocusRecordTableCell } = useUnfocusRecordTableCell(recordTableId);
  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordTableId);
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const getLookupRelationRecordKeys =
    useGetLookupRelationRecordKeys(recordTableId);

  return useCallback(
    <T extends ObjectRecord>({
      records,
      currentRecordGroupId,
    }: {
      records: T[];
      currentRecordGroupId?: string;
    }) => {
      upsertRecordsInStore({
        partialRecords: getRecordsWithLookupRelatedRecords({
          records: records,
          lookupRelationRecordKeys: getLookupRelationRecordKeys(),
        }),
      });

      const currentRowIds = currentRecordGroupId
        ? store.get(
            recordIndexRecordIdsByGroupFamilyState(currentRecordGroupId),
          )
        : store.get(recordIndexAllRecordIdsSelector);

      const isRecordGroupHiddenByTabs =
        store.get(isRecordGroupTabsDisplayed) &&
        isDefined(currentRecordGroupId) &&
        currentRecordGroupId !== store.get(activeRecordGroupTabId);

      const isAllRowsSelected =
        store.get(hasUserSelectedAllRecords) && !isRecordGroupHiddenByTabs;

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
      isRecordGroupTabsDisplayed,
      activeRecordGroupTabId,
      unfocusRecordTableCell,
      unfocusRecordTableRow,
      setRecordTableHoverPosition,
      isRowSelectedFamilyState,
      store,
      upsertRecordsInStore,
      getLookupRelationRecordKeys,
    ],
  );
};
