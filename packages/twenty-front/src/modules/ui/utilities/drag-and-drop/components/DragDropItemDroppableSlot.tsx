import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { DND_KIT_COLLISION_PRIORITY } from '@/ui/utilities/drag-and-drop/constants/DndKitCollisionPriority';

const StyledSlotWrapper = styled.div`
  align-self: stretch;
  flex: 0 0 2px;
  margin-left: -1px;
  margin-right: -1px;
  min-height: 0;
  position: relative;
  z-index: 100;
`;

type DragDropItemDroppableSlotProps = {
  children?: ReactNode;
  collisionPriority?: number;
  disabled?: boolean;
  droppableId: string;
  index: number;
};

export const DragDropItemDroppableSlot = ({
  children,
  collisionPriority = DND_KIT_COLLISION_PRIORITY,
  disabled = false,
  droppableId,
  index,
}: DragDropItemDroppableSlotProps) => {
  const id = `${droppableId}::${index}`;
  const data: DragDropItemData = { droppableId, index };

  const { ref } = useDroppable({
    id,
    disabled,
    collisionPriority,
    collisionDetector: pointerIntersection,
    data,
  });

  return <StyledSlotWrapper ref={ref}>{children}</StyledSlotWrapper>;
};
