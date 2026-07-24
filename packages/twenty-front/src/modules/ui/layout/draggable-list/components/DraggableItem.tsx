import { useDragDropMonitor } from '@dnd-kit/react';
import { isFunction } from '@sniptt/guards';
import { type JSX, useContext, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { DraggableListGroupContext } from '@/ui/layout/draggable-list/contexts/DraggableListGroupContext';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';

type DraggableItemProps = {
  draggableId: string;
  isDragDisabled?: boolean;
  index: number;
  itemComponent:
    | JSX.Element
    | ((props: { isDragging: boolean }) => JSX.Element);
  disableDraggingBackground?: boolean;
};

export const DraggableItem = ({
  draggableId,
  isDragDisabled = false,
  index,
  itemComponent,
  disableDraggingBackground = false,
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

  // The list's end drop zone resolves its drop index from this registry,
  // since only the rendered items know how many of them there are.
  useEffect(() => {
    if (!isDefined(draggableListGroupContext)) {
      return;
    }

    const itemIndexByDraggableId =
      draggableListGroupContext.itemIndexByDraggableId;

    itemIndexByDraggableId.set(draggableId, index);

    return () => {
      itemIndexByDraggableId.delete(draggableId);
    };
  }, [draggableListGroupContext, draggableId, index]);

  if (!isDefined(draggableListGroupContext)) {
    throw new Error('DraggableItem must be rendered inside a DraggableList');
  }

  const { group } = draggableListGroupContext;

  return (
    <DragDropItemSortableCell
      id={draggableId}
      index={index}
      group={group}
      type={group}
      accept={group}
      disabled={isDragDisabled}
      highlightWhileDragging={!disableDraggingBackground}
      dropLine="horizontal"
    >
      {isFunction(itemComponent)
        ? itemComponent({ isDragging })
        : itemComponent}
    </DragDropItemSortableCell>
  );
};
