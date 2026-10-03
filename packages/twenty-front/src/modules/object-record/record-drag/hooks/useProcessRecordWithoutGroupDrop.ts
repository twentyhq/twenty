import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { type RecordDragDropResult } from '@/object-record/record-drag/types/RecordDragDropResult';
import { computeDroppedRecordPositions } from '@/object-record/record-drag/utils/computeDroppedRecordPositions';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { allRecordIdsWithoutGroupsComponentSelector } from '@/object-record/record-index/states/selectors/allRecordIdsWithoutGroupsComponentSelector';
import { getRecordIndexRemoveSortingModalId } from '@/object-record/record-index/utils/getRecordIndexRemoveSortingModalId';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

type UseProcessRecordWithoutGroupDropProps = {
  onBeforeRecordsUpdate?: (updatedRecords: RecordWithPosition[]) => void;
};

export const useProcessRecordWithoutGroupDrop = ({
  onBeforeRecordsUpdate,
}: UseProcessRecordWithoutGroupDropProps = {}) => {
  const store = useStore();
  const { recordIndexId, objectNameSingular } = useRecordIndexContextOrThrow();
  const { updateOneRecord } = useUpdateOneRecord();
  const { openDialog } = useDialog();

  const allRecordIdsWithoutGroupCallbackState =
    useAtomComponentSelectorCallbackState(
      allRecordIdsWithoutGroupsComponentSelector,
    );
  const draggedRecordIdsCallbackState = useAtomComponentStateCallbackState(
    draggedRecordIdsComponentState,
  );
  const currentRecordSortsCallbackState = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
  );

  const processRecordWithoutGroupDrop = useCallback(
    ({ draggedRecordId, destinationIndex }: RecordDragDropResult) => {
      if (store.get(currentRecordSortsCallbackState).length > 0) {
        openDialog(getRecordIndexRemoveSortingModalId(recordIndexId));
        return;
      }

      const updatedRecords = computeDroppedRecordPositions({
        destinationRecordIds: store.get(allRecordIdsWithoutGroupCallbackState),
        destinationIndex,
        draggedRecordId,
        draggedRecordIds: store.get(draggedRecordIdsCallbackState),
        store,
      });

      onBeforeRecordsUpdate?.(updatedRecords);

      for (const { id, position } of updatedRecords) {
        updateOneRecord({
          objectNameSingular,
          idToUpdate: id,
          updateOneRecordInput: { position },
        });
      }
    },
    [
      store,
      recordIndexId,
      objectNameSingular,
      openDialog,
      updateOneRecord,
      onBeforeRecordsUpdate,
      allRecordIdsWithoutGroupCallbackState,
      draggedRecordIdsCallbackState,
      currentRecordSortsCallbackState,
    ],
  );

  return { processRecordWithoutGroupDrop };
};
