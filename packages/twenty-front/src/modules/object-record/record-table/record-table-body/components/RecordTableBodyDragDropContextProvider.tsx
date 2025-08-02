import { DragDropContext, DragStart, DropResult } from '@hello-pangea/dnd';
import { ReactNode } from 'react';
import { useRecoilCallback } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { getDraggedRecordPosition } from '@/object-record/record-board/utils/getDraggedRecordPosition';
import { getDragOperationType } from '@/object-record/record-board/utils/getDragOperationType';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from 'twenty-shared/utils';
import { useEndTableRowDrag } from '../../hooks/useEndTableRowDrag';
import { useStartTableRowDrag } from '../../hooks/useStartTableRowDrag';
import { useTableRowDragState } from '../../hooks/useTableRowDragState';
import { selectedRowIdsComponentSelector } from '../../states/selectors/selectedRowIdsComponentSelector';
import { processMultiTableDrag } from '../../utils/processMultiTableDrag';

export const RecordTableBodyDragDropContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { objectNameSingular, recordTableId } = useRecordTableContextOrThrow();

  const { updateOneRecord: updateOneRow } = useUpdateOneRecord({
    objectNameSingular,
  });

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const selectedRowIdsSelector = useRecoilComponentCallbackStateV2(
    selectedRowIdsComponentSelector,
    recordTableId,
  );

  const currentRecordSorts = useRecoilComponentValueV2(
    currentRecordSortsComponentState,
  );

  const { openModal } = useModal();

  const startDrag = useStartTableRowDrag(recordTableId);
  const endDrag = useEndTableRowDrag(recordTableId);
  const multiDragState = useTableRowDragState(recordTableId);

  const handleDragStart = useRecoilCallback(
    ({ snapshot }) =>
      (start: DragStart) => {
        const currentSelectedRecordIds = getSnapshotValue(
          snapshot,
          selectedRowIdsSelector,
        );

        startDrag(start, currentSelectedRecordIds);
      },
    [selectedRowIdsSelector, startDrag],
  );

  const handleDragEnd = useRecoilCallback(
    ({ snapshot }) =>
      (result: DropResult) => {
        endDrag();

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
          const isSourceIndexBeforeDestinationIndex =
            result.source.index < result.destination.index;

          const recordBeforeDestinationId =
            allRecordIds[
              isSourceIndexBeforeDestinationIndex
                ? result.destination.index
                : result.destination.index - 1
            ];

          const recordBeforeDestination = recordBeforeDestinationId
            ? snapshot
                .getLoadable(recordStoreFamilyState(recordBeforeDestinationId))
                .getValue()
            : null;

          const recordAfterDestinationId =
            allRecordIds[
              isSourceIndexBeforeDestinationIndex
                ? result.destination.index + 1
                : result.destination.index
            ];

          const recordAfterDestination = recordAfterDestinationId
            ? snapshot
                .getLoadable(recordStoreFamilyState(recordAfterDestinationId))
                .getValue()
            : null;

          const newPosition = getDraggedRecordPosition(
            recordBeforeDestination?.position,
            recordAfterDestination?.position,
          );

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
          const recordPositionData = allRecordIds.map((recordId) => {
            const record = getSnapshotValue(
              snapshot,
              recordStoreFamilyState(recordId),
            );
            return {
              recordId,
              position: record?.position,
            };
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
      },
    [
      endDrag,
      currentRecordSorts.length,
      recordIndexAllRecordIdsSelector,
      selectedRowIdsSelector,
      multiDragState.originalSelection,
      updateOneRow,
      openModal,
    ],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
