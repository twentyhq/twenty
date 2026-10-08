import { DragDropProvider } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { DraggableListGroupContext } from '@/ui/layout/draggable-list/contexts/DraggableListGroupContext';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import {
  DragDropItemDndContext,
  type DragDropItemDndContextValue,
} from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { type DragDropProviderDragMoveEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragMoveEvent';
import { getDestinationIndex } from '@/ui/utilities/drag-and-drop/utils/getDestinationIndex';
import { resolveDropFromPointer } from '@/ui/utilities/drag-and-drop/utils/resolveDropFromPointer';

type DraggableListItemDndData = {
  droppableId: string;
  index: number;
};

type DraggableListProps = {
  draggableItems: React.ReactNode;
  onDragEnd: (result: DraggableListDropResult) => void;
};

const StyledDragDropItemsWrapper = styled.div`
  width: 100%;
`;

export const DraggableList = ({
  draggableItems,
  onDragEnd,
}: DraggableListProps) => {
  // The group id doubles as the items' dnd type, so drags cannot cross with outer providers' targets
  const [group] = useState(() => v4());

  // Consumer indices can be offset by a non-draggable header, so items register theirs to resolve the append position
  const [itemIndexByDraggableId] = useState(() => new Map<string, number>());
  const [trailingIndex, setTrailingIndex] = useState(0);

  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
    number | null
  >(null);

  const groupContextValue = useMemo(
    () => ({
      group,
      registerItem: (draggableId: string, index: number) => {
        itemIndexByDraggableId.set(draggableId, index);
        setTrailingIndex(Math.max(...itemIndexByDraggableId.values()) + 1);
      },
      unregisterItem: (draggableId: string) => {
        itemIndexByDraggableId.delete(draggableId);
        setTrailingIndex(
          itemIndexByDraggableId.size === 0
            ? 0
            : Math.max(...itemIndexByDraggableId.values()) + 1,
        );
      },
    }),
    [group, itemIndexByDraggableId],
  );

  const handleDragMove = (
    event: DragDropProviderDragMoveEvent<DraggableListItemDndData>,
  ) => {
    const resolvedDrop = resolveDropFromPointer({
      target: event.operation.target,
      pointer: event.operation.position.current,
      defaultOrientation: 'horizontal',
      getDroppableItemCount: () => trailingIndex,
    });

    setActiveDropTargetIndex(resolvedDrop?.dropTargetIndex ?? null);
  };

  const handleDragEnd = (
    event: DragDropProviderDragEndEvent<DraggableListItemDndData>,
  ) => {
    setActiveDropTargetIndex(null);

    const source = event.operation.source;
    const sourceData = source?.data as DraggableListItemDndData | undefined;

    if (
      event.canceled ||
      !isDefined(source) ||
      sourceData?.droppableId !== group
    ) {
      return;
    }

    const resolvedDrop = resolveDropFromPointer({
      target: event.operation.target,
      pointer: event.operation.position.current,
      defaultOrientation: 'horizontal',
      getDroppableItemCount: () => trailingIndex,
    });

    if (!isDefined(resolvedDrop) || resolvedDrop.droppableId !== group) {
      return;
    }

    const destinationIndex = getDestinationIndex({
      dropTargetIndex: resolvedDrop.dropTargetIndex,
      sourceIndex: sourceData.index,
      sourceDroppableId: group,
      destinationDroppableId: group,
    });

    if (destinationIndex === sourceData.index) {
      return;
    }

    onDragEnd({
      draggableId: String(source.id),
      source: { index: sourceData.index },
      destination: { index: destinationIndex },
    });
  };

  const contextValues: DragDropItemDndContextValue = {
    activeDropTargetIndex,
    activeDroppableId: group,
  };

  return (
    <DragDropItemDndContext.Provider value={contextValues}>
      <DragDropProvider<DraggableListItemDndData>
        sensors={DND_KIT_SENSORS}
        plugins={DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <DraggableListGroupContext.Provider value={groupContextValue}>
          <StyledDragDropItemsWrapper>
            {draggableItems}
            <DragDropItemDropTarget
              index={trailingIndex}
              droppableId={group}
              orientation="horizontal"
              compact
              seamAligned
            />
          </StyledDragDropItemsWrapper>
        </DraggableListGroupContext.Provider>
      </DragDropProvider>
    </DragDropItemDndContext.Provider>
  );
};
