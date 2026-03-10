import { useDroppable } from '@dnd-kit/react';
import { type ReactNode } from 'react';

import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/constants/AddToNavSourceDroppableId';

import type { AddToNavDroppableProvided } from '@/command-menu/components/CommandMenuAddToNavDroppableTypes';

type CommandMenuAddToNavDroppableDndKitProps = {
  children: (provided: AddToNavDroppableProvided) => ReactNode;
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
  const provided: AddToNavDroppableProvided = {
    innerRef: ref,
    droppableProps: { 'data-dnd-group': ADD_TO_NAV_SOURCE_DROPPABLE_ID },
    placeholder: null,
  };
  return <>{children(provided)}</>;
};
