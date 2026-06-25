import { type RecordTableHeaderDndData } from '@/object-record/record-table/record-table-header/dnd/types/RecordTableHeaderDndData';
import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

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

type RecordTableHeaderDroppableSlotProps = {
  droppableId: string;
  index: number;
  children?: ReactNode;
  disabled?: boolean;
  collisionPriority?: number;
};

export const RecordTableHeaderDroppableSlot = ({
  droppableId,
  index,
  children,
  disabled = false,
  collisionPriority = SLOT_COLLISION_PRIORITY,
}: RecordTableHeaderDroppableSlotProps) => {
  const id = `${droppableId}::${index}`;
  const data: RecordTableHeaderDndData = { droppableId, index };
  const { ref } = useDroppable({
    id,
    disabled,
    collisionPriority,
    collisionDetector: pointerIntersection,
    data,
  });

  return <StyledSlotWrapper ref={ref}>{children}</StyledSlotWrapper>;
};
