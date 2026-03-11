import { Draggable } from '@hello-pangea/dnd';
import { type ReactNode } from 'react';

type SidePanelAddToNavigationDraggablePlaceholderProps = {
  index: number;
  children: ReactNode;
};

export const SidePanelAddToNavigationDraggablePlaceholder = ({
  index,
  children,
}: SidePanelAddToNavigationDraggablePlaceholderProps) => (
  <Draggable
    draggableId={`add-to-nav-placeholder-${index}`}
    index={index}
    isDragDisabled={true}
  >
    {(provided) => (
      <div
        ref={provided.innerRef}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...provided.draggableProps}
      >
        {children}
      </div>
    )}
  </Draggable>
);
