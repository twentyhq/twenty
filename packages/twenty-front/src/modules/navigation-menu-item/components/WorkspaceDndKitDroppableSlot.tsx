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

type WorkspaceDndKitDroppableSlotProps = {
  droppableId: string;
  index: number;
  children?: ReactNode;
  disabled?: boolean;
};

export const WorkspaceDndKitDroppableSlot = ({
  droppableId,
  index,
  children,
  disabled = false,
}: WorkspaceDndKitDroppableSlotProps) => {
  const id = getDndKitDropTargetId(droppableId, index);
  const { ref } = useDroppable({
    id,
    disabled,
    collisionPriority: SLOT_COLLISION_PRIORITY,
  });

  const isEmpty =
    children == null || (Array.isArray(children) && children.length === 0);

  return (
    <StyledSlotWrapper ref={ref} $empty={isEmpty}>
      {children}
    </StyledSlotWrapper>
  );
};
