import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { CallbackInterface } from 'recoil';
import { getIndexNeighboursElementsFromArray } from '~/utils/array/getIndexNeighboursElementsFromArray';
import { getDraggedRecordPosition } from './getDraggedRecordPosition';

export interface MultiDragEndParams {
  result: Parameters<OnDragEndResponder>[0];
  selectedRecordIds: string[];
  recordIndexRecordIdsByGroupFamilyState: any;
  selectFieldMetadataItem: FieldMetadataItem;
  updateOneRecord: (params: {
    idToUpdate: string;
    updateOneRecordInput: Record<string, any>;
  }) => void;
  updateManyRecords?: (params: {
    recordsToUpdate: Array<{
      id: string;
      updateOneRecordInput: Record<string, any>;
    }>;
  }) => void;
}

export const handleMultiDragEnd = (
  { snapshot, set }: CallbackInterface,
  params: MultiDragEndParams,
): void => {
  const {
    result,
    selectedRecordIds,
    recordIndexRecordIdsByGroupFamilyState,
    selectFieldMetadataItem,
    updateOneRecord,
    updateManyRecords,
  } = params;

  if (!result.destination) return;

  const draggedRecordId = result.draggableId;
  const sourceRecordGroupId = result.source.droppableId;
  const destinationRecordGroupId = result.destination.droppableId;
  const destinationIndexInColumn = result.destination.index;

  if (!destinationRecordGroupId) return;

  const recordGroup = getSnapshotValue(
    snapshot,
    recordGroupDefinitionFamilyState(destinationRecordGroupId),
  );

  if (!recordGroup) return;

  // Check if the dragged item is selected
  const isDraggedItemSelected = selectedRecordIds.includes(draggedRecordId);

  // Determine which records to move
  const recordsToMove = isDraggedItemSelected
    ? selectedRecordIds
    : [draggedRecordId];

  // Get destination column records
  const destinationRecordByGroupIds = getSnapshotValue(
    snapshot,
    recordIndexRecordIdsByGroupFamilyState(destinationRecordGroupId),
  ) as string[];

  // Filter out records that are being moved to avoid position conflicts
  const otherRecordIdsInDestinationColumn = destinationRecordByGroupIds.filter(
    (recordId: string) => !recordsToMove.includes(recordId),
  );

  // Calculate base position for the group
  const { before: recordBeforeId, after: recordAfterId } =
    getIndexNeighboursElementsFromArray({
      index: destinationIndexInColumn,
      array: otherRecordIdsInDestinationColumn,
    });

  const recordBefore = recordBeforeId
    ? getSnapshotValue(snapshot, recordStoreFamilyState(recordBeforeId))
    : null;

  const recordAfter = recordAfterId
    ? getSnapshotValue(snapshot, recordStoreFamilyState(recordAfterId))
    : null;

  // Calculate positions for all records being moved
  const basePosition = getDraggedRecordPosition(
    recordBefore?.position,
    recordAfter?.position,
  );

  // Create update objects for all records
  const recordUpdates = recordsToMove.map((recordId, index) => {
    // For multiple records, slightly offset their positions to maintain order
    const position =
      recordsToMove.length > 1
        ? basePosition + index * 0.0001 // Small incremental offset
        : basePosition;

    return {
      id: recordId,
      updateOneRecordInput: {
        [selectFieldMetadataItem.name]: recordGroup.value,
        position,
      },
    };
  });

  // Update records - use batch update if available, otherwise update individually
  if (updateManyRecords && recordsToMove.length > 1) {
    updateManyRecords({
      recordsToUpdate: recordUpdates,
    });
  } else {
    // Fallback to individual updates
    recordUpdates.forEach((update) => {
      updateOneRecord({
        idToUpdate: update.id,
        updateOneRecordInput: update.updateOneRecordInput,
      });
    });
  }
};
