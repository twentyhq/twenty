import { DropResult } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined } from '~/utils/isDefined';

export const useComputeNewRowPosition = () => {
  return useRecoilCallback(
    ({ snapshot }) =>
      (result: DropResult, tableRowIds: string[]) => {
        if (!isDefined(result.destination)) {
          return;
        }

        const draggedRecordId = result.draggableId;
        const destinationIndex = result.destination.index;
        const sourceIndex = result.source.index;

        const recordBeforeId = tableRowIds[destinationIndex - 1];
        const recordDestinationId = tableRowIds[destinationIndex];
        const recordAfterDestinationId = tableRowIds[destinationIndex + 1];

        const recordBefore = recordBeforeId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordBeforeId))
              .getValue()
          : null;
        const recordDestination = recordDestinationId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordDestinationId))
              .getValue()
          : null;
        const recordAfterDestination = recordAfterDestinationId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordAfterDestinationId))
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

          const firstRecordPosition = firstRecord?.position ?? 0;

          if (moveToFirstPosition) {
            if (firstRecordPosition <= 0) {
              return firstRecordPosition - 1;
            } else {
              return firstRecordPosition / 2;
            }
          } else if (moveToLastPosition) {
            return lastRecord?.position + 1;
          } else if (moveAfterSource) {
            const recordAfterDestinationPosition =
              recordAfterDestination?.position ?? 0;
            const recordDestinationPosition = recordDestination?.position ?? 0;

            return (
              (recordAfterDestinationPosition + recordDestinationPosition) / 2
            );
          } else {
            return (
              recordDestination?.position -
              (recordDestination?.position - recordBefore?.position) / 2
            );
          }
        };

        const newPosition = computeNewPosition(destinationIndex, sourceIndex);

        return { draggedRecordId, newPosition };
      },
    [],
  );
};
