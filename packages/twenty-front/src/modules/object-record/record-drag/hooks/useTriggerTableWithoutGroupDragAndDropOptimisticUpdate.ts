import { useCallback } from 'react';
import { useStore } from 'jotai';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useLoadRecordsAtRowIndexes } from '@/object-record/record-table/virtualization/hooks/useLoadRecordsAtRowIndexes';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';

import { totalNumberOfRowsComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRowsComponentState';
import { getVirtualizationOverscanWindow } from '@/object-record/record-table/virtualization/utils/getVirtualizationOverscanWindow';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { findById, isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const useTriggerTableWithoutGroupDragAndDropOptimisticUpdate = () => {
  const store = useStore();
  const recordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const lastScrollPositionCallbackState = useAtomComponentStateCallbackState(
    lastScrollPositionComponentState,
  );
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();
  const totalNumberOfRowsCallbackState = useAtomComponentStateCallbackState(
    totalNumberOfRowsComponentState,
  );

  const { loadRecordsAtRowIndexes } = useLoadRecordsAtRowIndexes();

  const triggerTableWithoutGroupDragAndDropOptimisticUpdate = useCallback(
    (updatedRecords: RecordWithPosition[]) => {
      const tableScrollWrapperHeight =
        getScrollWrapperElement().scrollWrapperElement?.clientHeight ?? 0;

      const lastScrollPosition = store.get(lastScrollPositionCallbackState);

      const totalNumberOfRows = store.get(totalNumberOfRowsCallbackState) ?? 0;

      const { firstRowIndexInOverscanWindow, lastRowIndexInOverscanWindow } =
        getVirtualizationOverscanWindow({
          scrollPosition: lastScrollPosition,
          scrollWrapperHeight: tableScrollWrapperHeight,
          totalNumberOfRows,
        });

      const recordIds = store.get(
        recordIdsByGroupCallbackState(NO_RECORD_GROUP_FAMILY_KEY),
      );

      const recordsInOverscanWindowToReorder: RecordWithPosition[] = [];

      for (
        let rowIndex = firstRowIndexInOverscanWindow;
        rowIndex <= lastRowIndexInOverscanWindow;
        rowIndex++
      ) {
        const recordIdAtRowIndex = recordIds[rowIndex];

        if (!isDefined(recordIdAtRowIndex)) {
          continue;
        }

        const correspondingRecordInStore = store.get(
          recordStoreFamilyState.atomFamily(recordIdAtRowIndex),
        );

        if (
          isDefined(correspondingRecordInStore) &&
          isDefined(correspondingRecordInStore.position)
        ) {
          const correspondingDraggedRecord = updatedRecords.find(
            findById(correspondingRecordInStore.id),
          );

          const hasRecordBeenDragged = isDefined(correspondingDraggedRecord);

          const positionToUse = hasRecordBeenDragged
            ? correspondingDraggedRecord.position
            : correspondingRecordInStore.position;

          recordsInOverscanWindowToReorder.push({
            id: correspondingRecordInStore.id,
            position: positionToUse,
          });
        }
      }

      const shouldReorderRecordsInOverscanWindow =
        recordsInOverscanWindowToReorder.length > 0;

      if (!shouldReorderRecordsInOverscanWindow) {
        return;
      }

      const reorderedRecordsWithPosition =
        recordsInOverscanWindowToReorder.toSorted(sortByProperty('position'));

      loadRecordsAtRowIndexes({
        records: reorderedRecordsWithPosition as any[],
        startingRowIndex: firstRowIndexInOverscanWindow,
      });
    },
    [
      lastScrollPositionCallbackState,
      loadRecordsAtRowIndexes,
      recordIdsByGroupCallbackState,
      getScrollWrapperElement,
      store,
      totalNumberOfRowsCallbackState,
    ],
  );

  return { triggerTableWithoutGroupDragAndDropOptimisticUpdate };
};
