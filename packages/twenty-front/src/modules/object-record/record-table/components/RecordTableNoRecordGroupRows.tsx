import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { getContiguousIncrementalValues } from 'twenty-shared/utils';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableNoRecordGroupAddNew } from '@/object-record/record-table/components/RecordTableNoRecordGroupAddNew';
import { RECORD_TABLE_NO_RECORD_GROUP_DROPPABLE_ID } from '@/object-record/record-table/constants/RecordTableNoRecordGroupDroppableId';
import { RECORD_TABLE_ROW_DND_TYPE } from '@/object-record/record-table/constants/RecordTableRowDndType';
import { RecordTableRowVirtualizedContainer } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedContainer';
import { RecordTableVirtualizedBodyPlaceholder } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedBodyPlaceholder';
import { RecordTableVirtualizedDebugHelper } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedDebugHelper';
import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DND_KIT_COLLISION_PRIORITY } from '@/ui/utilities/drag-and-drop/constants/DndKitCollisionPriority';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledNoRecordGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  // The mobile navigation bar floats over the page, so the rows reserve its
  // footprint to keep the last one reachable.
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-bottom: ${themeCssVariables.spacing[20]};
  }
`;

const StyledEndDropZone = styled.div`
  position: relative;
  width: 100%;
`;

export const RecordTableNoRecordGroupRows = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const totalNumberOfRecordsToVirtualize =
    useAtomComponentStateValue(
      totalNumberOfRecordsToVirtualizeComponentState,
    ) ?? 0;

  const isDraggingRecord = useAtomComponentStateValue(
    isDraggingRecordComponentState,
    recordIndexId,
  );

  const numberOfRows = Math.min(
    totalNumberOfRecordsToVirtualize,
    NUMBER_OF_VIRTUALIZED_ROWS,
  );

  const virtualRowIndices = getContiguousIncrementalValues(numberOfRows);

  // Catches drops past the last row, where no row sortable is under the
  // pointer; the drop target inside only renders the insertion indicator.
  const { ref: endDropZoneRef } = useDroppable({
    id: RECORD_TABLE_NO_RECORD_GROUP_DROPPABLE_ID,
    accept: RECORD_TABLE_ROW_DND_TYPE,
    collisionPriority: DND_KIT_COLLISION_PRIORITY,
    collisionDetector: pointerIntersection,
    data: { droppableId: RECORD_TABLE_NO_RECORD_GROUP_DROPPABLE_ID },
  });

  return (
    <StyledNoRecordGroupContainer>
      <RecordTableVirtualizedBodyPlaceholder />
      {virtualRowIndices.map((virtualRowIndex) => {
        return (
          <RecordTableRowVirtualizedContainer
            key={virtualRowIndex}
            virtualIndex={virtualRowIndex}
          />
        );
      })}
      <StyledEndDropZone ref={endDropZoneRef}>
        {/* Zero footprint at rest; expands during a row drag so the zone
            stays droppable even when the add-new row is hidden. */}
        <DragDropItemDropTarget
          index={totalNumberOfRecordsToVirtualize}
          droppableId={RECORD_TABLE_NO_RECORD_GROUP_DROPPABLE_ID}
          orientation="horizontal"
          compact={!isDraggingRecord}
          seamAligned
        />
        <RecordTableNoRecordGroupAddNew />
      </StyledEndDropZone>
      <RecordTableVirtualizedDebugHelper />
    </StyledNoRecordGroupContainer>
  );
};
