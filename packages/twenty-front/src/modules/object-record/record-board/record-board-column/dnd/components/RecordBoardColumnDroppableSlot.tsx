import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { type RecordBoardColumnDndData } from '@/object-record/record-board/record-board-column/dnd/types/RecordBoardColumnDndData';

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

type RecordBoardColumnDroppableSlotProps = {
  children?: ReactNode;
  disabled?: boolean;
  droppableId: string;
  index: number;
};

export const RecordBoardColumnDroppableSlot = ({
  children,
  disabled = false,
  droppableId,
  index,
}: RecordBoardColumnDroppableSlotProps) => {
  const id = `${droppableId}::${index}`;
  const data: RecordBoardColumnDndData = { droppableId, index };

  const { ref } = useDroppable({
    id,
    disabled,
    collisionPriority: SLOT_COLLISION_PRIORITY,
    collisionDetector: pointerIntersection,
    data,
  });

  return <StyledSlotWrapper ref={ref}>{children}</StyledSlotWrapper>;
};
