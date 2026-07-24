import { useDragDropMonitor } from '@dnd-kit/react';
import { isFunction } from '@sniptt/guards';
import { type JSX, useContext, useState } from 'react';
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
  const group = useContext(DraggableListGroupContext);

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

  if (!isDefined(group)) {
    throw new Error('DraggableItem must be rendered inside a DraggableList');
  }

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
      {isFunction(itemComponent) ? itemComponent({ isDragging }) : itemComponent}
    </DragDropItemSortableCell>
  );
};
