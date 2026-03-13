import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getDndKitDropTargetId } from '@/navigation-menu-item/utils/getDndKitDropTargetId';
import type { DroppableData } from '@/navigation/types/workspaceDndKitDroppableData';

const StyledSlotWrapper = styled.div<{ $empty: boolean }>`
  min-height: 0;
  ${({ $empty }) =>
    $empty ? `min-height: ${themeCssVariables.spacing[2]};` : ''}
`;

const SLOT_COLLISION_PRIORITY = 1;

export const FOLDER_HEADER_SLOT_COLLISION_PRIORITY = 2;

type WorkspaceDndKitDroppableSlotProps = {
  droppableId: string;
  index: number;
  children?: ReactNode;
  disabled?: boolean;
  collisionPriority?: number;
};

export const WorkspaceDndKitDroppableSlot = ({
  droppableId,
  index,
  children,
  disabled = false,
  collisionPriority = SLOT_COLLISION_PRIORITY,
}: WorkspaceDndKitDroppableSlotProps) => {
  const id = getDndKitDropTargetId(droppableId, index);
  const data: DroppableData = { droppableId, index };
  const { ref } = useDroppable({
    id,
    disabled,
    collisionPriority,
    data,
  });

  const isEmpty =
    children == null || (Array.isArray(children) && children.length === 0);

  return (
    <StyledSlotWrapper ref={ref} $empty={isEmpty}>
      {children}
    </StyledSlotWrapper>
  );
};
