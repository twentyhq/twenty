import { type DropResult } from '@hello-pangea/dnd';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

import { useTriggerTableWithoutGroupDragAndDropOptimisticUpdate } from '@/object-record/record-drag/hooks/useTriggerTableWithoutGroupDragAndDropOptimisticUpdate';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { getDragOperationType } from '@/object-record/record-drag/utils/getDragOperationType';
import { processMultiDrag } from '@/object-record/record-drag/utils/processMultiDrag';
import { processSingleDrag } from '@/object-record/record-drag/utils/processSingleDrag';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { allRecordIdsWithoutGroupsComponentSelector } from '@/object-record/record-index/states/selectors/allRecordIdsWithoutGroupsComponentSelector';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useStore } from 'jotai';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useProcessTableWithoutGroupRecordDrop = () => {
  const store = useStore();
  const { recordIndexId } = useRecordIndexContextOrThrow();
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { updateOneRecord } = useUpdateOneRecord();

  const allRecordIdsWithoutGroup = useAtomComponentSelectorCallbackState(
    allRecordIdsWithoutGroupsComponentSelector,
  );

  const selectedRowIds = useAtomComponentSelectorCallbackState(
    selectedRowIdsComponentSelector,
  );

  const originalDragSelection = useAtomComponentStateCallbackState(
    originalDragSelectionComponentState,
    recordIndexId,
  );

  const currentRecordSorts = useAtomComponentStateValue(
    currentRecordSortsComponentState,
  );

  const { openModal } = useModal();

  const { triggerTableWithoutGroupDragAndDropOptimisticUpdate } =
    useTriggerTableWithoutGroupDragAndDropOptimisticUpdate();

  const processTableWithoutGroupRecordDrop = useCallback(
    async (tableRecordDropResult: DropResult) => {
      if (!tableRecordDropResult.destination) return;

      if (currentRecordSorts.length > 0) {
        openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
        return;
      }

      const allSparseRecordIds = store.get(allRecordIdsWithoutGroup);

      const draggedRecordId = tableRecordDropResult.draggableId;
      const selectedRecordIds = store.get(selectedRowIds);

      const isDroppedAfterList =
        tableRecordDropResult.destination.index + 1 >=
        allSparseRecordIds.length;

      const recordsWithPosition: RecordWithPosition[] = allSparseRecordIds
        .filter((recordId): recordId is string => isDefined(recordId))
        .map((recordId: string) => {
          const record = store.get(recordStoreFamilyState.atomFamily(recordId));
          return {
            id: recordId,
            position: record?.position ?? 0,
          };
        });

      const contiguousRecordsWithPosition =
        recordsWithPosition.filter(isDefined);

      const dragOperationType = getDragOperationType({
        draggedRecordId,
        selectedRecordIds,
      });

      if (dragOperationType === 'single') {
        const targetRecordId = allSparseRecordIds.at(
          tableRecordDropResult.destination.index,
        );

        if (!isDefined(targetRecordId)) {
          throw new Error(
            `Target record id cannot be found, this should not happen`,
          );
        }

        const singleDragResult = processSingleDrag({
          sourceRecordId: draggedRecordId,
          targetRecordId: targetRecordId ?? '',
          recordsWithPosition: contiguousRecordsWithPosition,
          isDroppedAfterList,
        });

        if (!isDefined(singleDragResult.position)) {
          return;
        }

        triggerTableWithoutGroupDragAndDropOptimisticUpdate([singleDragResult]);

        updateOneRecord({
          objectNameSingular,
          idToUpdate: singleDragResult.id,
          updateOneRecordInput: {
            position: singleDragResult.position,
          },
        });
      } else {
        const targetRecordId = allSparseRecordIds.at(
          tableRecordDropResult.destination.index,
        );

        if (!isDefined(targetRecordId)) {
          throw new Error(
            `Target record id cannot be found, this should not happen`,
          );
        }

        const existingOriginalDragSelection = store.get(originalDragSelection);

        const multiDragResult = processMultiDrag({
          draggedRecordId,
          targetRecordId: targetRecordId ?? '',
          selectedRecordIds: existingOriginalDragSelection,
          recordsWithPosition: contiguousRecordsWithPosition,
          isDroppedAfterList,
        });

        triggerTableWithoutGroupDragAndDropOptimisticUpdate(
          multiDragResult.recordUpdates,
        );

        for (const update of multiDragResult.recordUpdates) {
          updateOneRecord({
            objectNameSingular,
            idToUpdate: update.id,
            updateOneRecordInput: {
              position: update.position,
            },
          });
        }
      }
    },
    [
      objectNameSingular,
      selectedRowIds,
      store,
      updateOneRecord,
      openModal,
      currentRecordSorts,
      originalDragSelection,
      allRecordIdsWithoutGroup,
      triggerTableWithoutGroupDragAndDropOptimisticUpdate,
    ],
  );

  return { processTableWithoutGroupRecordDrop };
};
