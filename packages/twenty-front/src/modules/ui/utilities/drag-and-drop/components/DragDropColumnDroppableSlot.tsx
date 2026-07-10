import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { type DragDropColumnData } from '@/ui/utilities/drag-and-drop/types/DragDropColumnData';

const StyledSlotWrapper = styled.div`
  align-self: stretch;
  flex: 0 0 2px;
  margin-left: -1px;
  margin-right: -1px;
  min-height: 0;
  position: relative;
  z-index: 100;
`;

const SLOT_COLLISION_PRIORITY = 1;

type DragDropColumnDroppableSlotProps = {
  children?: ReactNode;
  collisionPriority?: number;
  disabled?: boolean;
  droppableId: string;
  index: number;
};

export const DragDropColumnDroppableSlot = ({
  children,
  collisionPriority = SLOT_COLLISION_PRIORITY,
  disabled = false,
  droppableId,
  index,
}: DragDropColumnDroppableSlotProps) => {
  const id = `${droppableId}::${index}`;
  const data: DragDropColumnData = { droppableId, index };

  const { ref } = useDroppable({
    id,
    disabled,
    collisionPriority,
    collisionDetector: pointerIntersection,
    data,
  });

  return <StyledSlotWrapper ref={ref}>{children}</StyledSlotWrapper>;
};
