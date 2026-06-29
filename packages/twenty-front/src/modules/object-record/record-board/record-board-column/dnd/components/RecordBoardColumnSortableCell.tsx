import { RestrictToHorizontalAxis } from '@dnd-kit/abstract/modifiers';
import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';
import { useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { RecordBoardColumnSortableHandleRefContext } from '@/object-record/record-board/record-board-column/dnd/context/RecordBoardColumnSortableHandleRefContext';

const SORTABLE_COLLISION_PRIORITY = 3;
const PLUGINS_WITHOUT_OPTIMISTIC = [SortableKeyboardPlugin];
const RECORD_BOARD_HEADER_SORTABLE_MODIFIERS = [RestrictToHorizontalAxis];
const RECORD_BOARD_HEADER_SORTABLE_TRANSITION = {
  duration: 180,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  idle: true,
};

const StyledSortableRoot = styled.div`
  min-height: 0;
  outline: none;
  position: relative;
  will-change: transform;
`;

type RecordBoardColumnSortableCellProps = {
  children: ReactNode;
  disabled?: boolean;
  group: string;
  id: string;
  index: number;
};

export const RecordBoardColumnSortableCell = ({
  children,
  disabled = false,
  group,
  id,
  index,
}: RecordBoardColumnSortableCellProps) => {
  const { handleRef, ref } = useSortable({
    id,
    index,
    group,
    collisionPriority: SORTABLE_COLLISION_PRIORITY,
    data: {
      droppableId: group,
      index,
    },
    disabled,
    transition: RECORD_BOARD_HEADER_SORTABLE_TRANSITION,
    plugins: PLUGINS_WITHOUT_OPTIMISTIC,
    modifiers: RECORD_BOARD_HEADER_SORTABLE_MODIFIERS,
    feedback: 'clone',
  });

  return (
    <RecordBoardColumnSortableHandleRefContext.Provider value={handleRef}>
      <StyledSortableRoot ref={ref} data-record-board-column="true">
        {children}
      </StyledSortableRoot>
    </RecordBoardColumnSortableHandleRefContext.Provider>
  );
};
