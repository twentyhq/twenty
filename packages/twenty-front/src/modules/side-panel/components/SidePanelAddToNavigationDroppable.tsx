import { lazy, Suspense, useContext, type ReactNode } from 'react';

import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/constants/AddToNavSourceDroppableId';
import { NavigationDragSourceContext } from '@/navigation-menu-item/contexts/NavigationDragSourceContext';

import type { AddToNavDroppableProvided } from '@/command-menu/components/CommandMenuAddToNavDroppableTypes';

const FALLBACK_PROVIDED: AddToNavDroppableProvided = {
  innerRef: () => {},
  droppableProps: {},
  placeholder: null,
};

const CommandMenuAddToNavDroppableDndKit = lazy(() =>
  import('@/command-menu/components/CommandMenuAddToNavDroppableDndKit').then(
    (m) => ({ default: m.CommandMenuAddToNavDroppableDndKit }),
  ),
);

type SidePanelAddToNavigationDroppableProps = {
  children: (provided: AddToNavDroppableProvided) => ReactNode;
};

export const SidePanelAddToNavigationDroppable = ({
  children,
}: SidePanelAddToNavigationDroppableProps) => {
  const { sourceDroppableId } = useContext(NavigationDragSourceContext);
  const isDropDisabled = sourceDroppableId === ADD_TO_NAV_SOURCE_DROPPABLE_ID;

  return (
    <Suspense fallback={children(FALLBACK_PROVIDED)}>
      <CommandMenuAddToNavDroppableDndKit
        children={children}
        isDropDisabled={isDropDisabled}
      />
    </Suspense>
  );
};
