import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useLoadRecordsToVirtualRows } from '@/object-record/record-table/virtualization/hooks/useLoadRecordsToVirtualRows';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { getVirtualizationOverscanWindow } from '@/object-record/record-table/virtualization/utils/getVirtualizationOverscanWindow';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { findById, isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';

// TODO: does not work when scrolling while dragging and does not work if not paired with a network refetch right after
// But it's sufficient right now for the main use case
export const useTriggerTableWithoutGroupDragAndDropOptimisticUpdate = () => {
  const recordIdByRealIndexCallbackFamilyState =
    useRecoilComponentCallbackState(recordIdByRealIndexComponentFamilyState);

  const lastScrollPositionCallbackState = useRecoilComponentCallbackState(
    lastScrollPositionComponentState,
  );
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();
  const totalNumberOfRecordsToVirtualizeCallbackState =
    useRecoilComponentCallbackState(
      totalNumberOfRecordsToVirtualizeComponentState,
    );

  const { loadRecordsToVirtualRows } = useLoadRecordsToVirtualRows();

  const triggerTableWithoutGroupDragAndDropOptimisticUpdate = useRecoilCallback(
    ({ snapshot }) =>
      (updatedRecords: RecordWithPosition[]) => {
        const tableScrollWrapperHeight =
          scrollWrapperHTMLElement?.clientHeight ?? 0;

        const lastScrollPosition = getSnapshotValue(
          snapshot,
          lastScrollPositionCallbackState,
        );

        const totalNumberOfRecordsToVirtualize =
          getSnapshotValue(
            snapshot,
            totalNumberOfRecordsToVirtualizeCallbackState,
          ) ?? 0;

        const {
          firstRealIndexInOverscanWindow,
          lastRealIndexInOverscanWindow,
        } = getVirtualizationOverscanWindow(
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
          const recordIdAtRealIndex = getSnapshotValue(
            snapshot,
            recordIdByRealIndexCallbackFamilyState({ realIndex }),
          );

          if (!isDefined(recordIdAtRealIndex)) {
            continue;
          }

          const correspondingRecordInStore = getSnapshotValue(
            snapshot,
            recordStoreFamilyState(recordIdAtRealIndex),
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
      recordIdByRealIndexCallbackFamilyState,
      scrollWrapperHTMLElement?.clientHeight,
      totalNumberOfRecordsToVirtualizeCallbackState,
    ],
  );

  return { triggerTableWithoutGroupDragAndDropOptimisticUpdate };
};
