import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const useTableRowDragHandler = (
  objectNameSingular: string,
  viewSorts: any[],
  setIsRemoveSortingModalOpenState: any,
): OnDragEndResponder => {
  const { tableRowIdsState } = useRecordTableStates();
  const { updateOneRecord: updateOneRow } = useUpdateOneRecord({
    objectNameSingular,
  });

  return useRecoilCallback(
    ({ snapshot }) =>
      (result) => {
        if (!result.destination) {
          return;
        }
        if (viewSorts.length > 0) {
          setIsRemoveSortingModalOpenState(true);
          return;
        }
        const tableRowIds = snapshot.getLoadable(tableRowIdsState).getValue();

        const draggedRecordId = result.draggableId;
        const destinationIndex = result.destination.index;
        const sourceIndex = result.source.index;

        const recordBeforeId = tableRowIds[destinationIndex - 1];
        const recordAfterId = tableRowIds[destinationIndex];
        const recordAfterAfterId = tableRowIds[destinationIndex + 1];

        const recordBefore = recordBeforeId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordBeforeId))
              .getValue()
          : null;
        const recordAfter = recordAfterId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordAfterId))
              .getValue()
          : null;
        const recordAfterAfter = recordAfterAfterId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordAfterAfterId))
              .getValue()
          : null;

        const computeNewPosition = (destIndex: number, sourceIndex: number) => {
          const moveToFirstPosition = destIndex === 0;
          const moveToLastPosition = destIndex === tableRowIds.length - 1;
          const moveAfterSource = destIndex > sourceIndex;

          const firstRecord = tableRowIds[0]
            ? snapshot
                .getLoadable(recordStoreFamilyState(tableRowIds[0]))
                .getValue()
            : null;

          const lastRecord = tableRowIds[tableRowIds.length - 1]
            ? snapshot
                .getLoadable(
                  recordStoreFamilyState(tableRowIds[tableRowIds.length - 1]),
                )
                .getValue()
            : null;

          if (moveToFirstPosition) {
            return firstRecord?.position / 2;
          } else if (moveToLastPosition) {
            return lastRecord?.position + 1;
          } else if (moveAfterSource) {
            return (recordAfterAfter?.position + recordAfter?.position) / 2;
          } else {
            return (
              recordAfter?.position -
              (recordAfter?.position - recordBefore?.position) / 2
            );
          }
        };

        const newposition = computeNewPosition(destinationIndex, sourceIndex);

        updateOneRow({
          idToUpdate: draggedRecordId,
          updateOneRecordInput: {
            position: newposition,
          },
        });
      },
    [
      updateOneRow,
      viewSorts.length,
      setIsRemoveSortingModalOpenState,
      tableRowIdsState,
    ],
  );
};
