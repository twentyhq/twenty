import {
  RestrictToHorizontalAxis,
  RestrictToVerticalAxis,
} from '@dnd-kit/abstract/modifiers';
import { useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { DragDropItemDropLine } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropLine';
import { DND_KIT_PLUGINS_WITHOUT_OPTIMISTIC } from '@/ui/utilities/drag-and-drop/constants/DndKitPluginsWithoutOptimistic';
import { DragDropItemSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemSortableHandleRefContext';
import { preventNativeDragStart } from '@/ui/utilities/drag-and-drop/utils/preventNativeDragStart';

const SORTABLE_COLLISION_PRIORITY = 3;

const SORTABLE_TRANSITION = {
  duration: 180,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  idle: true,
};

const StyledSortableRoot = styled.div<{
  $fill?: boolean;
  $isDraggingHighlighted?: boolean;
}>`
  background: ${({ $isDraggingHighlighted }) =>
    $isDraggingHighlighted
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border-radius: ${({ $isDraggingHighlighted }) =>
    $isDraggingHighlighted ? themeCssVariables.border.radius.sm : '0'};
  display: ${({ $fill }) => ($fill ? 'flex' : 'block')};
  flex-shrink: ${({ $fill }) => ($fill ? 0 : 'initial')};
  height: ${({ $fill }) => ($fill ? '100%' : 'auto')};
  min-height: 0;
  min-width: ${({ $fill }) => ($fill ? '0' : 'auto')};
  outline: none;
  position: relative;
  transition: background 0.1s ease;
  will-change: transform;
`;

type DragDropItemSortableCellProps = {
  accept?: string;
  children: ReactNode;
  data?: Record<string, unknown>;
  disabled?: boolean;
  fill?: boolean;
  group: string;
  hasTransition?: boolean;
  highlightWhileDragging?: boolean;
  id: string;
  index: number;
  restrictMovementTo?: 'x' | 'y' | 'none';
  dropLine?: 'horizontal' | 'vertical' | 'none';
  type?: string;
};

export const DragDropItemSortableCell = ({
  accept,
  children,
  data,
  disabled = false,
  fill = false,
  group,
  hasTransition = true,
  highlightWhileDragging = false,
  id,
  index,
  restrictMovementTo = 'none',
  dropLine = 'none',
  type,
}: DragDropItemSortableCellProps) => {
  const { handleRef, ref, isDragging, isDragSource, isDropTarget } =
    useSortable({
      id,
      index,
      group,
      type,
      accept,
      collisionPriority: SORTABLE_COLLISION_PRIORITY,
      // Sortable metadata stays authoritative over consumer data so drag
      // handlers always resolve the cell's real group and position.
      data: {
        ...data,
        droppableId: group,
        index,
      },
      disabled,
      transition: hasTransition ? SORTABLE_TRANSITION : null,
      plugins: DND_KIT_PLUGINS_WITHOUT_OPTIMISTIC,
      modifiers: [
        ...(restrictMovementTo === 'x' ? [RestrictToHorizontalAxis] : []),
        ...(restrictMovementTo === 'y' ? [RestrictToVerticalAxis] : []),
      ],
      feedback: 'clone',
    });

  // The drag source is its own initial drop target; rendering the line on it
  // would bake a stale copy into the placeholder clone taken at drag start.
  const shouldShowDropLine =
    dropLine !== 'none' && isDropTarget && !isDragSource;

  return (
    <DragDropItemSortableHandleRefContext.Provider value={handleRef}>
      <StyledSortableRoot
        ref={ref}
        $fill={fill}
        $isDraggingHighlighted={highlightWhileDragging && isDragging}
        onDragStart={preventNativeDragStart}
      >
        {shouldShowDropLine && <DragDropItemDropLine orientation={dropLine} />}
        {children}
      </StyledSortableRoot>
    </DragDropItemSortableHandleRefContext.Provider>
  );
};
