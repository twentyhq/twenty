import { useSortable } from '@dnd-kit/react/sortable';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { SortableDropTargetRefContext } from '@/navigation-menu-item/contexts/SortableDropTargetRefContext';

const SORTABLE_COLLISION_PRIORITY = 3;

const StyledDropIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.sm}
    ${({ theme }) => theme.border.radius.sm} 0 0;
  pointer-events: none;
  z-index: 1;
`;

const StyledSortableRoot = styled.div`
  min-height: 0;
  position: relative;
`;

type WorkspaceDndKitSortableItemProps = {
  children: ReactNode;
  disabled?: boolean;
  group: string;
  id: string;
  index: number;
};

export const WorkspaceDndKitSortableItem = ({
  id,
  index,
  group,
  disabled = false,
  children,
}: WorkspaceDndKitSortableItemProps) => {
  const { handleRef, isDropTarget, ref, targetRef } = useSortable({
    id,
    index,
    group,
    collisionPriority: SORTABLE_COLLISION_PRIORITY,
    data: {
      sourceDroppableId: group,
      sourceIndex: index,
    },
    disabled,
  });

  return (
    <SortableDropTargetRefContext.Provider value={targetRef}>
      <StyledSortableRoot
        ref={(el) => {
          ref(el);
          handleRef?.(el);
        }}
      >
        {isDropTarget && <StyledDropIndicator />}
        {children}
      </StyledSortableRoot>
    </SortableDropTargetRefContext.Provider>
  );
};
