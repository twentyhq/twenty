import { useDragDropMonitor } from '@dnd-kit/react';
import { isFunction } from '@sniptt/guards';
import { Fragment, type JSX, useContext, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { DraggableListGroupContext } from '@/ui/layout/draggable-list/contexts/DraggableListGroupContext';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';

type DraggableItemProps = {
  draggableId: string;
  isDragDisabled?: boolean;
  index: number;
  itemComponent:
    | JSX.Element
    | ((props: { isDragging: boolean }) => JSX.Element);
  disableDraggingBackground?: boolean;
  restrictMovementTo?: 'x' | 'y' | 'none';
};

export const DraggableItem = ({
  draggableId,
  isDragDisabled = false,
  index,
  itemComponent,
  disableDraggingBackground = false,
  restrictMovementTo = 'y',
}: DraggableItemProps) => {
  const draggableListGroupContext = useContext(DraggableListGroupContext);

  const [isDragging, setIsDragging] = useState(false);

  useDragDropMonitor({
    onDragStart: (event) => {
      if (String(event.operation.source?.id) === draggableId) {
        setIsDragging(true);
      }
    },
    onDragEnd: () => {
      setIsDragging(false);
    },
  });

  // Items report their presence so the list can size its trailing drop target.
  useEffect(() => {
    if (!isDefined(draggableListGroupContext)) {
      return;
    }

    const { registerItem, unregisterItem } = draggableListGroupContext;
    registerItem(draggableId, index);

    return () => {
      unregisterItem(draggableId);
    };
  }, [draggableListGroupContext, draggableId, index]);

  if (!isDefined(draggableListGroupContext)) {
    throw new Error('DraggableItem must be rendered inside a DraggableList');
  }

  const { group } = draggableListGroupContext;

  return (
    <Fragment>
      <DragDropItemDropTarget
        index={index}
        droppableId={group}
        orientation="horizontal"
        compact
        seamAligned
      />
      <DragDropItemSortableCell
        id={draggableId}
        index={index}
        group={group}
        type={group}
        accept={group}
        disabled={isDragDisabled}
        highlightWhileDragging={!disableDraggingBackground}
        orientation="horizontal"
        restrictMovementTo={restrictMovementTo}
      >
        {isFunction(itemComponent)
          ? itemComponent({ isDragging })
          : itemComponent}
      </DragDropItemSortableCell>
    </Fragment>
  );
};
