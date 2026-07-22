import {
  RestrictToHorizontalAxis,
  RestrictToVerticalAxis,
} from '@dnd-kit/abstract/modifiers';
import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';
import { useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';
import { type DragEvent, type ReactNode } from 'react';

import { DragDropItemSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemSortableHandleRefContext';

const SORTABLE_COLLISION_PRIORITY = 3;

const PLUGINS_WITHOUT_OPTIMISTIC = [SortableKeyboardPlugin];

const SORTABLE_TRANSITION = {
  duration: 180,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  idle: true,
};

// Links and images inside sortable items are natively draggable, which lets
// the browser start a URL drag that cancels the dnd-kit pointer drag.
const preventNativeDragStart = (event: DragEvent) => {
  event.preventDefault();
};

const StyledSortableRoot = styled.div<{ $fill?: boolean }>`
  display: ${({ $fill }) => ($fill ? 'flex' : 'block')};
  flex-shrink: ${({ $fill }) => ($fill ? 0 : 'initial')};
  height: ${({ $fill }) => ($fill ? '100%' : 'auto')};
  min-height: 0;
  min-width: ${({ $fill }) => ($fill ? '0' : 'auto')};
  outline: none;
  position: relative;
  will-change: transform;
`;

type DragDropItemSortableCellProps = {
  accept?: string;
  children: ReactNode;
  disabled?: boolean;
  fill?: boolean;
  group: string;
  id: string;
  index: number;
  restrictMovementTo?: 'x' | 'y' | 'none';
  type?: string;
};

export const DragDropItemSortableCell = ({
  accept,
  children,
  disabled = false,
  fill = false,
  group,
  id,
  index,
  restrictMovementTo = 'none',
  type,
}: DragDropItemSortableCellProps) => {
  const { handleRef, ref } = useSortable({
    id,
    index,
    group,
    type,
    accept,
    collisionPriority: SORTABLE_COLLISION_PRIORITY,
    data: {
      droppableId: group,
      index,
    },
    disabled,
    transition: SORTABLE_TRANSITION,
    plugins: PLUGINS_WITHOUT_OPTIMISTIC,
    modifiers: [
      ...(restrictMovementTo === 'x' ? [RestrictToHorizontalAxis] : []),
      ...(restrictMovementTo === 'y' ? [RestrictToVerticalAxis] : []),
    ],
    feedback: 'clone',
  });

  return (
    <DragDropItemSortableHandleRefContext.Provider value={handleRef}>
      <StyledSortableRoot
        ref={ref}
        $fill={fill}
        onDragStart={preventNativeDragStart}
      >
        {children}
      </StyledSortableRoot>
    </DragDropItemSortableHandleRefContext.Provider>
  );
};
