import { DropResult } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined } from '~/utils/isDefined';

export const useComputeNewRecordPosition = () => {
  return useRecoilCallback(
    ({ snapshot }) =>
      (result: DropResult, recordIds: string[]) => {
        if (!isDefined(result.destination)) {
          return;
        }

        console.log(result.destination.index);

        const destinationIndex = result.destination.index;
        const sourceIndex = result.source.index;

        const isSourceDestinationDroppableSame =
          result.source.droppableId === result.destination.droppableId;

        const recordDestinationId = recordIds[destinationIndex];
        const recordDestination = recordDestinationId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordDestinationId))
              .getValue()
          : null;

        if (destinationIndex === 0) {
          const newPosition = recordDestination?.position - 1;

          return { newPosition };
        }

        if (destinationIndex === recordIds.length - 1) {
          const newPosition = recordDestination?.position + 1;

          return { newPosition };
        }

        const recordBeforeDestinationIndex =
          !isSourceDestinationDroppableSame || destinationIndex > sourceIndex
            ? destinationIndex - 1
            : destinationIndex;

        const recordBeforeDestinationId =
          recordIds[recordBeforeDestinationIndex];
        console.log(recordBeforeDestinationId);

        const recordBeforeDestination = recordBeforeDestinationId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordBeforeDestinationId))
              .getValue()
          : null;

        const recordAfterDestinationIndex =
          !isSourceDestinationDroppableSame || destinationIndex < sourceIndex
            ? destinationIndex + 1
            : destinationIndex;

        const recordAfterDestinationId = recordIds[recordAfterDestinationIndex];
        console.log(recordAfterDestinationId);
        const recordAfterDestination = recordAfterDestinationId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordAfterDestinationId))
              .getValue()
          : null;

        const newPosition =
          (recordBeforeDestination?.position +
            recordAfterDestination?.position) /
          2;

        return { newPosition };
      },
    [],
  );
};
