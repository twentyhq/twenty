import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import type { DroppableData } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDroppableData';

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
export const FOLDER_HEADER_SLOT_COLLISION_PRIORITY = 4;

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
  const id = `record-table-header-droppable::${index}`;
  const data: DroppableData = { droppableId, index };
  const { ref } = useDroppable({
    id,
    disabled,
    collisionPriority,
    collisionDetector: pointerIntersection,
    data,
  });

  return <StyledSlotWrapper ref={ref}>{children}</StyledSlotWrapper>;
};
