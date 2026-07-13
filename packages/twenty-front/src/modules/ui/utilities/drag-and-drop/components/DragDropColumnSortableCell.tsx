import { RestrictToHorizontalAxis } from '@dnd-kit/abstract/modifiers';
import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';
import { useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { DragDropColumnSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropColumnSortableHandleRefContext';

const SORTABLE_COLLISION_PRIORITY = 3;

const PLUGINS_WITHOUT_OPTIMISTIC = [SortableKeyboardPlugin];

// Columns can only be reordered horizontally, so keep the drag preview locked to the header row.
const SORTABLE_MODIFIERS = [RestrictToHorizontalAxis];

const SORTABLE_TRANSITION = {
  duration: 180,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  idle: true,
};

const StyledSortableRoot = styled.div<{ $fill?: boolean }>`
  display: ${({ $fill }) => ($fill ? 'flex' : 'block')};
  height: ${({ $fill }) => ($fill ? '100%' : 'auto')};
  min-height: 0;
  min-width: ${({ $fill }) => ($fill ? '0' : 'auto')};
  outline: none;
  position: relative;
  will-change: transform;
`;

type DragDropColumnSortableCellProps = {
  children: ReactNode;
  disabled?: boolean;
  fill?: boolean;
  group: string;
  id: string;
  index: number;
};

export const DragDropColumnSortableCell = ({
  children,
  disabled = false,
  fill = false,
  group,
  id,
  index,
}: DragDropColumnSortableCellProps) => {
  const { handleRef, ref } = useSortable({
    id,
    index,
    group,
    collisionPriority: SORTABLE_COLLISION_PRIORITY,
    data: {
      droppableId: group,
      index,
    },
    disabled,
    transition: SORTABLE_TRANSITION,
    plugins: PLUGINS_WITHOUT_OPTIMISTIC,
    modifiers: SORTABLE_MODIFIERS,
    feedback: 'clone',
  });

  return (
    <DragDropColumnSortableHandleRefContext.Provider value={handleRef}>
      <StyledSortableRoot ref={ref} $fill={fill}>
        {children}
      </StyledSortableRoot>
    </DragDropColumnSortableHandleRefContext.Provider>
  );
};
