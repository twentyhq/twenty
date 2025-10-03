import { type DropResult } from '@hello-pangea/dnd';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { getDragOperationType } from '@/object-record/record-drag/shared/utils/getDragOperationType';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from 'twenty-shared/utils';

import { useRecordDragState } from '@/object-record/record-drag/shared/hooks/useRecordDragState';
import { extractRecordPositions } from '@/object-record/record-drag/shared/utils/extractRecordPositions';
import { processMultiDrag } from '@/object-record/record-drag/shared/utils/processMultiDrag';
import { processSingleDrag } from '@/object-record/record-drag/shared/utils/processSingleDrag';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { useRecoilCallback } from 'recoil';

export const useRecordTableDragOperations = () => {
  const { objectNameSingular, recordTableId } = useRecordTableContextOrThrow();

  const { updateOneRecord: updateOneRow } = useUpdateOneRecord({
    objectNameSingular,
  });

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
  );

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

  const processDragOperation = useRecoilCallback(
    ({ snapshot }) =>
      async (result: DropResult) => {
        if (!result.destination) return;

        if (currentRecordSorts.length > 0) {
          openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
          return;
        }

        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );

        const draggedRecordId = result.draggableId;
        const selectedRecordIds = getSnapshotValue(
          snapshot,
          selectedRowIdsSelector,
        );

        const recordPositionData = extractRecordPositions(
          allRecordIds,
          snapshot,
        );

        const dragOperationType = getDragOperationType({
          draggedRecordId,
          selectedRecordIds,
        });

        if (dragOperationType === 'single') {
          const singleDragResult = processSingleDrag({
            result,
            recordPositionData,
            recordIds: allRecordIds,
          });

          if (!isDefined(singleDragResult.position)) {
            return;
          }

          updateOneRow({
            idToUpdate: singleDragResult.recordId,
            updateOneRecordInput: {
              position: singleDragResult.position,
            },
          });
        } else {
          const multiDragResult = processMultiDrag({
            result,
            selectedRecordIds: multiDragState.originalSelection,
            recordPositionData,
            recordIds: allRecordIds,
          });

          for (const update of multiDragResult.recordUpdates) {
            updateOneRow({
              idToUpdate: update.recordId,
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
      recordIndexAllRecordIdsSelector,
      resetVirtualization,
      triggerFetchPagesWithoutDebounce,
    ],
  );

  return { processDragOperation };
};
