import { useDraggable } from '@dnd-kit/react';
import { type ReactNode } from 'react';

import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/common/constants/AddToNavSourceDroppableId';

type CommandMenuItemWithAddToNavigationDragDndKitProps = {
  id: string;
  dragIndex: number;
  menuItemContent: ReactNode;
};

export const CommandMenuItemWithAddToNavigationDragDndKit = ({
  id,
  dragIndex,
  menuItemContent,
}: CommandMenuItemWithAddToNavigationDragDndKitProps) => {
  const { ref } = useDraggable({
    id,
    data: {
      sourceDroppableId: ADD_TO_NAV_SOURCE_DROPPABLE_ID,
      sourceIndex: dragIndex,
    },
    disabled: false,
    feedback: 'clone',
  });
  return <div ref={ref}>{menuItemContent}</div>;
};
