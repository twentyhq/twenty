import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexTableLazyQuery } from '@/object-record/record-index/hooks/useRecordIndexTableLazyQuery';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import {
  NO_RECORD_GROUP_FAMILY_KEY,
  recordIndexAllRecordIdsComponentSelector,
} from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableHorizontalScrollShadowVisibilityCssVariableName';
import { RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableVerticalScrollShadowVisibilityCssVariableName';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useScrollTableToPosition } from '@/object-record/record-table/hooks/useScrollTableToPosition';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { updateRecordTableCSSVariable } from '@/object-record/record-table/utils/updateRecordTableCSSVariable';
import { useLoadRecordsAtRowIndexes } from '@/object-record/record-table/virtualization/hooks/useLoadRecordsAtRowIndexes';
import { useReapplyRowSelection } from '@/object-record/record-table/virtualization/hooks/useReapplyRowSelection';
import { useAllocateRowSlots } from '@/object-record/record-table/virtualization/hooks/useAllocateRowSlots';

import { useResetTableFocuses } from '@/object-record/record-table/virtualization/hooks/useResetTableFocuses';
import { isInitializingVirtualTableDataLoadingComponentState } from '@/object-record/record-table/virtualization/states/isInitializingVirtualTableDataLoadingComponentState';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { scrollAtRowIndexComponentState } from '@/object-record/record-table/virtualization/states/scrollAtRowIndexComponentState';
import { totalNumberOfRowsComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRowsComponentState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const useTriggerInitialRecordTableDataLoad = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const { recordLimit } = useRecordIndexContextOrThrow();

  const { findManyRecordsLazy } =
    useRecordIndexTableLazyQuery(objectNameSingular);

  const isInitializingVirtualTableDataLoadingCallbackState =
    useAtomComponentStateCallbackState(
      isInitializingVirtualTableDataLoadingComponentState,
    );

  const isRecordTableInitialLoading = useAtomComponentStateCallbackState(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const recordIndexAllRecordIds = useAtomComponentSelectorCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const recordIndexRecordIdsByGroupFamilyState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const setIsRecordTableScrolledHorizontally = useSetAtomComponentState(
    isRecordTableScrolledHorizontallyComponentState,
  );

  const setIsRecordTableScrolledVertically = useSetAtomComponentState(
    isRecordTableScrolledVerticallyComponentState,
  );

  const lastScrollPositionCallbackState = useAtomComponentStateCallbackState(
    lastScrollPositionComponentState,
  );

  const scrollAtRowIndexCallbackState = useAtomComponentStateCallbackState(
    scrollAtRowIndexComponentState,
  );

  const { scrollTableToPosition } = useScrollTableToPosition();

  const { allocateRowSlots } = useAllocateRowSlots();

  const { resetTableFocuses } = useResetTableFocuses(recordTableId);
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { loadRecordsAtRowIndexes } = useLoadRecordsAtRowIndexes();

  const { reapplyRowSelection } = useReapplyRowSelection();

  const totalNumberOfRowsCallbackState = useAtomComponentStateCallbackState(
    totalNumberOfRowsComponentState,
  );

  const triggerInitialRecordTableDataLoad = useCallback(
    async ({
      shouldScrollToStart = true,
    }: { shouldScrollToStart?: boolean } = {}) => {
      const isInitializingVirtualTableDataLoading = store.get(
        isInitializingVirtualTableDataLoadingCallbackState,
      );

      if (isInitializingVirtualTableDataLoading) {
        return;
      }

      store.set(isInitializingVirtualTableDataLoadingCallbackState, true);

      try {
        const hasRecordsToKeepDisplayed = isNonEmptyArray(
          store.get(recordIndexAllRecordIds),
        );

        if (!hasRecordsToKeepDisplayed) {
          store.set(isRecordTableInitialLoading, true);
        }

        resetTableFocuses();

        updateRecordTableCSSVariable(
          recordTableId,
          RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME,
          'hidden',
        );

        updateRecordTableCSSVariable(
          recordTableId,
          RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME,
          'hidden',
        );

        const clearLoadedRecords = () => {
          store.set(
            recordIndexRecordIdsByGroupFamilyState(NO_RECORD_GROUP_FAMILY_KEY),
            [],
          );
        };

        let findManyRecordsResult: Awaited<
          ReturnType<typeof findManyRecordsLazy>
        >;

        try {
          findManyRecordsResult = await findManyRecordsLazy();
        } finally {
          clearLoadedRecords();
        }

        const { records, totalCount } = findManyRecordsResult;

        store.set(
          totalNumberOfRowsCallbackState,
          isDefined(recordLimit)
            ? Math.min(totalCount, recordLimit)
            : totalCount,
        );

        if (isDefined(records)) {
          upsertRecordsInStore({ partialRecords: records });

          loadRecordsAtRowIndexes({
            records,
            startingRowIndex: 0,
          });

          reapplyRowSelection();
        }

        store.set(lastScrollPositionCallbackState, 0);
        store.set(scrollAtRowIndexCallbackState, 0);

        allocateRowSlots();

        setIsRecordTableScrolledHorizontally(false);
        setIsRecordTableScrolledVertically(false);
        resetTableFocuses();

        if (shouldScrollToStart) {
          scrollTableToPosition({
            horizontalScrollInPx: 0,
            verticalScrollInPx: 0,
          });
        }
      } finally {
        store.set(isInitializingVirtualTableDataLoadingCallbackState, false);
        store.set(isRecordTableInitialLoading, false);
      }
    },
    [
      isInitializingVirtualTableDataLoadingCallbackState,
      resetTableFocuses,
      allocateRowSlots,
      recordIndexAllRecordIds,
      recordIndexRecordIdsByGroupFamilyState,
      store,
      isRecordTableInitialLoading,
      lastScrollPositionCallbackState,
      scrollAtRowIndexCallbackState,
      setIsRecordTableScrolledHorizontally,
      setIsRecordTableScrolledVertically,
      scrollTableToPosition,
      findManyRecordsLazy,
      totalNumberOfRowsCallbackState,
      upsertRecordsInStore,
      loadRecordsAtRowIndexes,
      reapplyRowSelection,
      recordTableId,
      recordLimit,
    ],
  );

  return {
    triggerInitialRecordTableDataLoad,
  };
};
