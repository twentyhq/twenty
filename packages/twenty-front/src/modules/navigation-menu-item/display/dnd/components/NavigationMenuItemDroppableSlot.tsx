import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import type { DroppableData } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDroppableData';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';

const StyledSlotWrapper = styled.div<{ $empty: boolean }>`
  min-height: 0;
  ${({ $empty }) =>
    $empty ? `min-height: ${themeCssVariables.spacing[2]};` : ''}
`;

const SLOT_COLLISION_PRIORITY = 1;
export const FOLDER_HEADER_SLOT_COLLISION_PRIORITY = 4;

type NavigationMenuItemDroppableSlotProps = {
  droppableId: string;
  index: number;
  children?: ReactNode;
  disabled?: boolean;
  collisionPriority?: number;
};

export const NavigationMenuItemDroppableSlot = ({
  droppableId,
  index,
  children,
  disabled = false,
  collisionPriority = SLOT_COLLISION_PRIORITY,
}: NavigationMenuItemDroppableSlotProps) => {
  const id = getDndKitDropTargetId(droppableId, index);
  const data: DroppableData = { droppableId, index };
  const { ref } = useDroppable({
    id,
    disabled,
    collisionPriority,
    collisionDetector: pointerIntersection,
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
