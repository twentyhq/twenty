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
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useProcessTableWithoutGroupRecordDrop = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { updateOneRecord: updateOneRow } = useUpdateOneRecord({
    objectNameSingular,
  });

  const allRecordIdsWithoutGroupCallbackSelector =
    useRecoilComponentCallbackState(allRecordIdsWithoutGroupsComponentSelector);

  const selectedRowIdsSelector = useRecoilComponentCallbackState(
    selectedRowIdsComponentSelector,
  );

  const originalDragSelectionCallbackState = useRecoilComponentCallbackState(
    originalDragSelectionComponentState,
  );

  const currentRecordSorts = useRecoilComponentValue(
    currentRecordSortsComponentState,
  );

  const { openModal } = useModal();

  const { triggerTableWithoutGroupDragAndDropOptimisticUpdate } =
    useTriggerTableWithoutGroupDragAndDropOptimisticUpdate();

  const processTableWithoutGroupRecordDrop = useRecoilCallback(
    ({ snapshot }) =>
      async (tableRecordDropResult: DropResult) => {
        if (!tableRecordDropResult.destination) return;

        if (currentRecordSorts.length > 0) {
          openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
          return;
        }

        const allSparseRecordIds = getSnapshotValue(
          snapshot,
          allRecordIdsWithoutGroupCallbackSelector,
        );

        const draggedRecordId = tableRecordDropResult.draggableId;
        const selectedRecordIds = getSnapshotValue(
          snapshot,
          selectedRowIdsSelector,
        );

        const isDroppedAfterList =
          tableRecordDropResult.destination.index + 1 >=
          allSparseRecordIds.length;

        const recordsWithPosition: RecordWithPosition[] = allSparseRecordIds
          .filter(isDefined)
          .map((recordId) => ({
            id: recordId,
            position:
              getSnapshotValue(snapshot, recordStoreFamilyState(recordId))
                ?.position ?? null,
          }));

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

          triggerTableWithoutGroupDragAndDropOptimisticUpdate([
            singleDragResult,
          ]);

          updateOneRow({
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

          const originalDragSelection = getSnapshotValue(
            snapshot,
            originalDragSelectionCallbackState,
          );

          const multiDragResult = processMultiDrag({
            draggedRecordId,
            targetRecordId: targetRecordId ?? '',
            selectedRecordIds: originalDragSelection,
            recordsWithPosition: contiguousRecordsWithPosition,
            isDroppedAfterList,
          });

          triggerTableWithoutGroupDragAndDropOptimisticUpdate(
            multiDragResult.recordUpdates,
          );

          for (const update of multiDragResult.recordUpdates) {
            updateOneRow({
              idToUpdate: update.id,
              updateOneRecordInput: {
                position: update.position,
              },
            });
          }
        }
      },
    [
      selectedRowIdsSelector,
      updateOneRow,
      openModal,
      currentRecordSorts,
      originalDragSelectionCallbackState,
      allRecordIdsWithoutGroupCallbackSelector,
      triggerTableWithoutGroupDragAndDropOptimisticUpdate,
    ],
  );

  return { processTableWithoutGroupRecordDrop };
};
