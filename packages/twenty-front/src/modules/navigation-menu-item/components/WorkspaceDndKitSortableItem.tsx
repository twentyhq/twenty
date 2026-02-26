import { useSortable } from '@dnd-kit/react/sortable';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { SortableDropTargetRefContext } from '@/navigation-menu-item/contexts/SortableDropTargetRefContext';

const SORTABLE_COLLISION_PRIORITY = 3;

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
  const { handleRef, ref, targetRef } = useSortable({
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
        {children}
      </StyledSortableRoot>
    </SortableDropTargetRefContext.Provider>
  );
};
