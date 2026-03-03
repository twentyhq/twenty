import { useDroppable } from '@dnd-kit/react';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { getDndKitDropTargetId } from '@/navigation-menu-item/utils/getDndKitDropTargetId';

const StyledSlotWrapper = styled.div<{ $empty: boolean }>`
  min-height: 0;
  ${({ theme, $empty }) =>
    $empty &&
    `
    min-height: ${theme.spacing(2)};
  `}
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
  const { ref } = useDroppable({
    id,
    disabled,
    collisionPriority,
  });

  const isEmpty =
    children == null || (Array.isArray(children) && children.length === 0);

  return (
    <StyledSlotWrapper ref={ref} $empty={isEmpty}>
      {children}
    </StyledSlotWrapper>
  );
};
