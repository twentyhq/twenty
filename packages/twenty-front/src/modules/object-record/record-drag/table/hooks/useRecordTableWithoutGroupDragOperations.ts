import { type DropResult } from '@hello-pangea/dnd';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { getDragOperationType } from '@/object-record/record-drag/shared/utils/getDragOperationType';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from 'twenty-shared/utils';

import { useRecordDragState } from '@/object-record/record-drag/shared/hooks/useRecordDragState';
import { processMultiDrag } from '@/object-record/record-drag/shared/utils/processMultiDrag';

import { processSingleDrag } from '@/object-record/record-drag/shared/utils/processSingleDrag';
import { allRecordIdsWithoutGroupsComponentSelector } from '@/object-record/record-index/states/selectors/allRecordIdsWithoutGroupsComponentSelector';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useRecoilCallback } from 'recoil';

export const useRecordTableWithoutGroupDragOperations = () => {
  const { objectNameSingular, recordTableId } = useRecordTableContextOrThrow();

  const { updateOneRecord: updateOneRow } = useUpdateOneRecord({
    objectNameSingular,
  });

  const allRecordIdsWithoutGroupCallbackSelector =
    useRecoilComponentCallbackState(allRecordIdsWithoutGroupsComponentSelector);

  const selectedRowIdsSelector = useRecoilComponentCallbackState(
    selectedRowIdsComponentSelector,
    recordTableId,
  );

  const currentRecordSorts = useRecoilComponentValue(
    currentRecordSortsComponentState,
  );

  const { openModal } = useModal();
  const multiDragState = useRecordDragState('table', recordTableId);

  const { resetVirtualization } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const { triggerFetchPagesWithoutDebounce } = useTriggerFetchPages();

  const processDragOperationWithoutGroup = useRecoilCallback(
    ({ snapshot }) =>
      async (result: DropResult) => {
        if (!result.destination) return;

        if (currentRecordSorts.length > 0) {
          openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
          return;
        }

        const allSparseRecordIds = getSnapshotValue(
          snapshot,
          allRecordIdsWithoutGroupCallbackSelector,
        );

        const draggedRecordId = result.draggableId;
        const selectedRecordIds = getSnapshotValue(
          snapshot,
          selectedRowIdsSelector,
        );

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
            result.destination.index,
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
          });

          if (!isDefined(singleDragResult.position)) {
            return;
          }

          updateOneRow({
            idToUpdate: singleDragResult.id,
            updateOneRecordInput: {
              position: singleDragResult.position,
            },
          });
        } else {
          const targetRecordId = allSparseRecordIds.at(
            result.destination.index,
          );

          if (!isDefined(targetRecordId)) {
            throw new Error(
              `Target record id cannot be found, this should not happen`,
            );
          }

          const multiDragResult = processMultiDrag({
            draggedRecordId,
            targetRecordId: targetRecordId ?? '',
            selectedRecordIds: multiDragState.originalSelection,
            recordsWithPosition: contiguousRecordsWithPosition,
          });

          for (const update of multiDragResult.recordUpdates) {
            updateOneRow({
              idToUpdate: update.id,
              updateOneRecordInput: {
                position: update.position,
              },
            });
          }
        }

        await resetVirtualization();

        await triggerFetchPagesWithoutDebounce();
      },
    [
      selectedRowIdsSelector,
      updateOneRow,
      openModal,
      currentRecordSorts,
      multiDragState.originalSelection,
      allRecordIdsWithoutGroupCallbackSelector,
      resetVirtualization,
      triggerFetchPagesWithoutDebounce,
    ],
  );

  return { processDragOperationWithoutGroup };
};
