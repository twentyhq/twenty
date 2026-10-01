import { type CollisionDetector } from '@dnd-kit/abstract';
import { defaultCollisionDetection } from '@dnd-kit/collision';
import {
  RestrictToHorizontalAxis,
  RestrictToVerticalAxis,
} from '@dnd-kit/abstract/modifiers';
import { type UseSortableInput, useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';
import { type ReactNode, useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { DND_KIT_PLUGINS_WITHOUT_OPTIMISTIC } from '@/ui/utilities/drag-and-drop/constants/DndKitPluginsWithoutOptimistic';
import { DRAG_SOURCE_OPACITY } from '@/ui/utilities/drag-and-drop/constants/DragSourceOpacity';
import { DragDropItemSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemSortableHandleRefContext';
import { type DragDropItemDropTargetOrientation } from '@/ui/utilities/drag-and-drop/types/DragDropItemDropTargetOrientation';
import { preventNativeDragStart } from '@/ui/utilities/drag-and-drop/utils/preventNativeDragStart';
import { getOwnDndKitAccessibilityAttributes } from '@/ui/utilities/drag-and-drop/utils/getOwnDndKitAccessibilityAttributes';
import { removeDndKitAccessibilityAttributes } from '@/ui/utilities/drag-and-drop/utils/removeDndKitAccessibilityAttributes';

const SORTABLE_COLLISION_PRIORITY = 3;

const SORTABLE_TRANSITION = {
  duration: 180,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  idle: true,
};

const StyledSortableRoot = styled.div<{
  $disabled?: boolean;
  $fill?: boolean;
  $isDragSourceFaded?: boolean;
  $isDraggingHighlighted?: boolean;
}>`
  background: ${({ $isDraggingHighlighted }) =>
    $isDraggingHighlighted
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border-radius: ${({ $isDraggingHighlighted }) =>
    $isDraggingHighlighted ? themeCssVariables.border.radius.sm : '0'};
  cursor: ${({ $disabled }) => ($disabled ? 'inherit' : 'grab')};
  display: ${({ $fill }) => ($fill ? 'flex' : 'block')};
  flex-shrink: ${({ $fill }) => ($fill ? 0 : 'initial')};
  height: ${({ $fill }) => ($fill ? '100%' : 'auto')};
  min-height: 0;
  min-width: ${({ $fill }) => ($fill ? '0' : 'auto')};
  opacity: ${({ $isDragSourceFaded }) =>
    $isDragSourceFaded ? DRAG_SOURCE_OPACITY : 1};
  outline: none;
  position: relative;
  transition: background 0.1s ease;
  will-change: transform;

  &:has([data-dnd-sortable-handle]) {
    cursor: inherit;
  }
`;

type DragDropItemSortableCellProps = {
  accept?: UseSortableInput['accept'];
  allowNativeDragWhenDisabled?: boolean;
  children: ReactNode;
  collisionDetector?: CollisionDetector;
  data?: Record<string, unknown>;
  disabled?: boolean;
  fadeSourceWhileDragging?: boolean;
  fill?: boolean;
  group: string;
  hasTransition?: boolean;
  highlightWhileDragging?: boolean;
  id: string;
  index: number;
  restrictMovementTo?: 'x' | 'y' | 'none';
  // Lets a pointer resolver pick the drop boundary per item across lists of mixed orientations
  orientation?: DragDropItemDropTargetOrientation;
  sensors?: UseSortableInput['sensors'];
  type?: string;
};

export const DragDropItemSortableCell = ({
  accept,
  allowNativeDragWhenDisabled = false,
  children,
  collisionDetector = defaultCollisionDetection,
  data,
  disabled = false,
  fadeSourceWhileDragging = false,
  fill = false,
  group,
  hasTransition = true,
  highlightWhileDragging = false,
  id,
  index,
  restrictMovementTo = 'none',
  orientation,
  sensors,
  type,
}: DragDropItemSortableCellProps) => {
  const { handleRef, ref, isDragging, isDragSource } = useSortable({
    id,
    index,
    group,
    type,
    accept,
    collisionPriority: SORTABLE_COLLISION_PRIORITY,
    collisionDetector,
    // Sortable metadata overrides consumer data so handlers resolve the cell's real group and position
    data: {
      ...data,
      droppableId: group,
      index,
      ...(isDefined(orientation) ? { orientation } : {}),
    },
    disabled,
    sensors,
    transition: hasTransition ? SORTABLE_TRANSITION : null,
    plugins: DND_KIT_PLUGINS_WITHOUT_OPTIMISTIC,
    modifiers: [
      ...(restrictMovementTo === 'x' ? [RestrictToHorizontalAxis] : []),
      ...(restrictMovementTo === 'y' ? [RestrictToVerticalAxis] : []),
    ],
    feedback: 'clone',
  });

  const [ownAccessibilityAttributesByElement] = useState(
    () => new WeakMap<Element, Set<string>>(),
  );

  // A disabled sortable stays unregistered so dnd-kit cannot mark its
  // activator, and everything inside it, as a disabled button.
  const connectToDndKit = useCallback(
    (element: Element | null, connect: (element: Element | null) => void) => {
      if (!disabled) {
        if (
          isDefined(element) &&
          !ownAccessibilityAttributesByElement.has(element)
        ) {
          ownAccessibilityAttributesByElement.set(
            element,
            getOwnDndKitAccessibilityAttributes(element),
          );
        }
        connect(element);
        return;
      }

      connect(null);

      const ownAttributes = isDefined(element)
        ? ownAccessibilityAttributesByElement.get(element)
        : undefined;

      if (isDefined(element) && isDefined(ownAttributes)) {
        removeDndKitAccessibilityAttributes({ element, ownAttributes });
      }
    },
    [disabled, ownAccessibilityAttributesByElement],
  );

  const setSortableRef = useCallback(
    (element: Element | null) => connectToDndKit(element, ref),
    [connectToDndKit, ref],
  );

  const setSortableHandleRef = useCallback(
    (element: Element | null) => connectToDndKit(element, handleRef),
    [connectToDndKit, handleRef],
  );

  return (
    <DragDropItemSortableHandleRefContext.Provider value={setSortableHandleRef}>
      <StyledSortableRoot
        ref={setSortableRef}
        $disabled={disabled}
        $fill={fill}
        $isDragSourceFaded={fadeSourceWhileDragging && isDragSource}
        $isDraggingHighlighted={highlightWhileDragging && isDragging}
        onDragStart={
          disabled && allowNativeDragWhenDisabled
            ? undefined
            : preventNativeDragStart
        }
      >
        {children}
      </StyledSortableRoot>
    </DragDropItemSortableHandleRefContext.Provider>
  );
};
