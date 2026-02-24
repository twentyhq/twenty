import { useCallback } from 'react';
import { useStore } from 'jotai';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useLoadRecordsToVirtualRows } from '@/object-record/record-table/virtualization/hooks/useLoadRecordsToVirtualRows';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { recordIdByRealIndexComponentFamilySelector } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilySelector';

import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { getVirtualizationOverscanWindow } from '@/object-record/record-table/virtualization/utils/getVirtualizationOverscanWindow';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentFamilySelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilySelectorCallbackStateV2';
import { findById, isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const useTriggerTableWithoutGroupDragAndDropOptimisticUpdate = () => {
  const store = useStore();
  const recordIdByRealIndexCallbackSelector =
    useRecoilComponentFamilySelectorCallbackStateV2(
      recordIdByRealIndexComponentFamilySelector,
    );

  const lastScrollPositionCallbackState =
    useRecoilComponentStateCallbackStateV2(lastScrollPositionComponentState);
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();
  const totalNumberOfRecordsToVirtualizeCallbackState =
    useRecoilComponentStateCallbackStateV2(
      totalNumberOfRecordsToVirtualizeComponentState,
    );

  const { loadRecordsToVirtualRows } = useLoadRecordsToVirtualRows();

  const triggerTableWithoutGroupDragAndDropOptimisticUpdate = useCallback(
    (updatedRecords: RecordWithPosition[]) => {
      const tableScrollWrapperHeight =
        scrollWrapperHTMLElement?.clientHeight ?? 0;

      const lastScrollPosition = store.get(lastScrollPositionCallbackState);

      const totalNumberOfRecordsToVirtualize =
        store.get(totalNumberOfRecordsToVirtualizeCallbackState) ?? 0;

      const { firstRealIndexInOverscanWindow, lastRealIndexInOverscanWindow } =
        getVirtualizationOverscanWindow(
          lastScrollPosition,
          tableScrollWrapperHeight,
          totalNumberOfRecordsToVirtualize,
        );

      const recordsInOverscanWindowToReorder: RecordWithPosition[] = [];

      for (
        let realIndex = firstRealIndexInOverscanWindow;
        realIndex <= lastRealIndexInOverscanWindow;
        realIndex++
      ) {
        const recordIdAtRealIndex = store.get(
          recordIdByRealIndexCallbackSelector(realIndex),
        );

        if (!isDefined(recordIdAtRealIndex)) {
          continue;
        }

        const correspondingRecordInStore = store.get(
          recordStoreFamilyState.atomFamily(recordIdAtRealIndex),
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

      loadRecordsToVirtualRows({
        records: reorderedRecordsWithPosition as any[],
        startingRealIndex: firstRealIndexInOverscanWindow,
      });
    },
    [
      lastScrollPositionCallbackState,
      loadRecordsToVirtualRows,
      recordIdByRealIndexCallbackSelector,
      scrollWrapperHTMLElement?.clientHeight,
      store,
      totalNumberOfRecordsToVirtualizeCallbackState,
    ],
  );

  return { triggerTableWithoutGroupDragAndDropOptimisticUpdate };
};
