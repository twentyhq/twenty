import { Droppable, type DroppableProvided } from '@hello-pangea/dnd';
import { lazy, Suspense, useContext, type ReactNode } from 'react';

import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/constants/AddToNavSourceDroppableId';
import { NavigationDragSourceContext } from '@/navigation-menu-item/contexts/NavigationDragSourceContext';
import { WorkspaceDndKitContext } from '@/navigation/contexts/WorkspaceDndKitContext';

const CommandMenuAddToNavDroppableDndKit = lazy(() =>
  import('@/command-menu/components/CommandMenuAddToNavDroppableDndKit').then(
    (m) => ({ default: m.CommandMenuAddToNavDroppableDndKit }),
  ),
);

type CommandMenuAddToNavDroppableProps = {
  children: (provided: DroppableProvided) => ReactNode;
};

export const CommandMenuAddToNavDroppable = ({
  children,
}: CommandMenuAddToNavDroppableProps) => {
  const { sourceDroppableId } = useContext(NavigationDragSourceContext);
  const isDndKit = useContext(WorkspaceDndKitContext);
  const isDropDisabled = sourceDroppableId === ADD_TO_NAV_SOURCE_DROPPABLE_ID;

  if (isDndKit) {
    return (
      <Suspense
        fallback={children({
          innerRef: () => {},
          droppableProps: {},
          placeholder: null,
        } as DroppableProvided)}
      >
        <CommandMenuAddToNavDroppableDndKit
          children={children}
          isDropDisabled={isDropDisabled}
        />
      </Suspense>
    );
  }

  return (
    <Droppable
      droppableId={ADD_TO_NAV_SOURCE_DROPPABLE_ID}
      isDropDisabled={isDropDisabled}
    >
      {(provided) => children(provided)}
    </Droppable>
  );
};
