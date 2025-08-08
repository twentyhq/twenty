import { DropResult } from '@hello-pangea/dnd';

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
import { getNewSingleRecordDropPosition } from '@/object-record/record-drag/table/utils/getNewSingleRecordDropPosition';
import { getRecordPositionDataFromSnapshot } from '@/object-record/record-drag/shared/utils/getRecordPositionDataFromSnapshot';
import { processMultiTableDrag } from '@/object-record/record-drag/table/utils/processMultiTableDrag';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';

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

  const processDragEndOperation = (snapshot: any) => (result: DropResult) => {
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

    const operationType = getDragOperationType({
      draggedRecordId,
      selectedRecordIds,
    });

    if (operationType === 'single') {
      const newPosition = getNewSingleRecordDropPosition({
        result,
        allRecordIds,
        snapshot,
      });

      if (!isDefined(newPosition)) {
        return;
      }

      updateOneRow({
        idToUpdate: result.draggableId,
        updateOneRecordInput: {
          position: newPosition,
        },
      });
    } else {
      const recordPositionData = getRecordPositionDataFromSnapshot({
        allRecordIds,
        snapshot,
      });

      const multiDragResult = processMultiTableDrag({
        result,
        selectedRecordIds: multiDragState.originalSelection,
        recordPositionData,
        allRecordIds,
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
  };

  return { processDragEndOperation };
};
