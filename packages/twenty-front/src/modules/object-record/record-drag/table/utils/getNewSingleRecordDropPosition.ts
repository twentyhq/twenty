import { DropResult } from '@hello-pangea/dnd';
import { Snapshot } from 'recoil';

import { getDraggedRecordPosition } from '@/object-record/record-drag/shared/utils/getDraggedRecordPosition';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from 'twenty-shared/utils';

export const getNewSingleRecordDropPosition = ({
  result,
  allRecordIds,
  snapshot,
}: {
  result: DropResult;
  allRecordIds: string[];
  snapshot: Snapshot;
}): number | null => {
  if (!result.destination) {
    return null;
  }

  const isSourceIndexBeforeDestinationIndex =
    result.source.index < result.destination.index;

  const recordBeforeDestinationId =
    allRecordIds[
      isSourceIndexBeforeDestinationIndex
        ? result.destination.index
        : result.destination.index - 1
    ];

  const recordBeforeDestination = recordBeforeDestinationId
    ? getSnapshotValue(
        snapshot,
        recordStoreFamilyState(recordBeforeDestinationId),
      )
    : null;

  const afterDestinationIndex = isSourceIndexBeforeDestinationIndex
    ? result.destination.index + 1
    : result.destination.index;

  const recordAfterDestinationId =
    afterDestinationIndex < allRecordIds.length
      ? allRecordIds[afterDestinationIndex]
      : undefined;

  const recordAfterDestination = recordAfterDestinationId
    ? getSnapshotValue(
        snapshot,
        recordStoreFamilyState(recordAfterDestinationId),
      )
    : null;

  const newPosition = getDraggedRecordPosition(
    recordBeforeDestination?.position,
    recordAfterDestination?.position,
  );

  return isDefined(newPosition) ? newPosition : null;
};
