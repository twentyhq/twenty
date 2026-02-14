import { Droppable, type DroppableProvided } from '@hello-pangea/dnd';
import { type ReactNode, useContext } from 'react';

import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/constants/AddToNavSourceDroppableId';
import { NavigationDragSourceContext } from '@/navigation-menu-item/contexts/NavigationDragSourceContext';

type CommandMenuAddToNavDroppableProps = {
  children: (provided: DroppableProvided) => ReactNode;
};

export const CommandMenuAddToNavDroppable = ({
  children,
}: CommandMenuAddToNavDroppableProps) => {
  const { sourceDroppableId } = useContext(NavigationDragSourceContext);
  const isDropDisabled = sourceDroppableId === ADD_TO_NAV_SOURCE_DROPPABLE_ID;

  return (
    <Droppable
      droppableId={ADD_TO_NAV_SOURCE_DROPPABLE_ID}
      isDropDisabled={isDropDisabled}
    >
      {(provided) => children(provided)}
    </Droppable>
  );
};
