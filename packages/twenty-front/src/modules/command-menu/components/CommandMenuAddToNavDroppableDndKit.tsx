import { useDroppable } from '@dnd-kit/react';
import { type ReactNode } from 'react';

import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/constants/AddToNavSourceDroppableId';
import type { DroppableProvided } from '@hello-pangea/dnd';

type CommandMenuAddToNavDroppableDndKitProps = {
  children: (provided: DroppableProvided) => ReactNode;
  isDropDisabled: boolean;
};

export const CommandMenuAddToNavDroppableDndKit = ({
  children,
  isDropDisabled,
}: CommandMenuAddToNavDroppableDndKitProps) => {
  const { ref } = useDroppable({
    id: ADD_TO_NAV_SOURCE_DROPPABLE_ID,
    disabled: isDropDisabled,
  });
  return (
    <>
      {children({
        innerRef: ref,
        droppableProps: {},
        placeholder: null,
      } as DroppableProvided)}
    </>
  );
};
