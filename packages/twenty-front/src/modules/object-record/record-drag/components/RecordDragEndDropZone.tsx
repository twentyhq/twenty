import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DND_KIT_COLLISION_PRIORITY } from '@/ui/utilities/drag-and-drop/constants/DndKitCollisionPriority';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledEndDropZone = styled.div`
  position: relative;
  width: 100%;
`;

type RecordDragEndDropZoneProps = {
  droppableId: string;
  dndType: string;
  index: number;
  children?: ReactNode;
};

// Catches drops past the last record, where no record is under the pointer
export const RecordDragEndDropZone = ({
  droppableId,
  dndType,
  index,
  children,
}: RecordDragEndDropZoneProps) => {
  const isDraggingRecord = useAtomComponentStateValue(
    isDraggingRecordComponentState,
  );

  const { ref } = useDroppable({
    id: droppableId,
    accept: dndType,
    collisionPriority: DND_KIT_COLLISION_PRIORITY,
    collisionDetector: pointerIntersection,
    data: { droppableId },
  });

  return (
    <StyledEndDropZone ref={ref}>
      {/* Expands during a drag so the zone stays droppable when nothing renders below it */}
      <DragDropItemDropTarget
        index={index}
        droppableId={droppableId}
        orientation="horizontal"
        compact={!isDraggingRecord}
        seamAligned
      />
      {children}
    </StyledEndDropZone>
  );
};
