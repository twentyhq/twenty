import { useDroppable } from '@dnd-kit/react';
import { pointerIntersection } from '@dnd-kit/collision';
import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';
import type { DroppableData } from '@/navigation-menu-item/common/types/NavigationMenuItemDndKitDroppableData';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';
import { getNavigationMenuItemListDroppableId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemListDroppableId';
import { isNavigationMenuItemTabOrSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTabOrSection';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

const TAB_DROP_TARGET_COLLISION_PRIORITY = 5;

const StyledTabDropTarget = styled.span`
  border-radius: ${themeCssVariables.border.radius.smRound};
  display: flex;
  min-width: 0;
  transition: box-shadow 150ms ease-in-out;

  &[data-drag-over='true'] {
    background-color: ${themeCssVariables.background.transparent.blue};
    box-shadow: 0 0 0 1px ${themeCssVariables.color.blue};
  }
`;

type NavigationMenuTabDropTargetProps = {
  tabId: string | null;
  children: ReactNode;
};

export const NavigationMenuTabDropTarget = ({
  tabId,
  children,
}: NavigationMenuTabDropTargetProps) => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const { activeDropTargetId } = useContext(NavigationDropTargetContext);

  const droppableId = getNavigationMenuItemListDroppableId({
    parentId: tabId,
    navigationMenuItemSection: 'workspace',
  });
  const appendIndex = workspaceNavigationMenuItems.filter(
    (item) =>
      (item.parentId ?? null) === tabId &&
      !isNavigationMenuItemTabOrSection(item),
  ).length;
  const id = getDndKitDropTargetId(droppableId, appendIndex);
  const data: DroppableData = { droppableId, index: appendIndex };

  const { ref } = useDroppable({
    id,
    collisionPriority: TAB_DROP_TARGET_COLLISION_PRIORITY,
    collisionDetector: pointerIntersection,
    data,
  });

  return (
    <StyledTabDropTarget ref={ref} data-drag-over={activeDropTargetId === id}>
      {children}
    </StyledTabDropTarget>
  );
};
