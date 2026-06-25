import { Draggable } from '@hello-pangea/dnd';
import { type ReactNode } from 'react';

import { getCssCompatibleDraggableProps } from '@/ui/layout/draggable-list/utils/getCssCompatibleDraggableProps';

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
        {...getCssCompatibleDraggableProps(provided.draggableProps)}
      >
        {children}
      </div>
    )}
  </Draggable>
);
