import { RestrictToHorizontalAxis } from '@dnd-kit/abstract/modifiers';
import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';
import { useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { RecordTableHeaderSortableHandleRefContext } from '@/object-record/record-table/record-table-header/dnd/context/RecordTableHeaderSortableHandleRefContext';

const SORTABLE_COLLISION_PRIORITY = 3;

const PLUGINS_WITHOUT_OPTIMISTIC = [SortableKeyboardPlugin];

// Columns can only be reordered horizontally, so keep the drag preview locked to the header row.
const RECORD_TABLE_HEADER_SORTABLE_MODIFIERS = [RestrictToHorizontalAxis];

const RECORD_TABLE_HEADER_SORTABLE_TRANSITION = {
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

type RecordTableHeaderSortableCellProps = {
  children: ReactNode;
  disabled?: boolean;
  group: string;
  id: string;
  index: number;
};

export const RecordTableHeaderSortableCell = ({
  id,
  index,
  group,
  disabled = false,
  children,
}: RecordTableHeaderSortableCellProps) => {
  const { handleRef, ref } = useSortable({
    id,
    index,
    group,
    collisionPriority: SORTABLE_COLLISION_PRIORITY,
    data: {
      droppableId: group,
      index: index,
    },
    disabled,
    transition: RECORD_TABLE_HEADER_SORTABLE_TRANSITION,
    plugins: PLUGINS_WITHOUT_OPTIMISTIC,
    modifiers: RECORD_TABLE_HEADER_SORTABLE_MODIFIERS,
    feedback: 'clone',
  });

  return (
    <RecordTableHeaderSortableHandleRefContext.Provider value={handleRef}>
      <StyledSortableRoot ref={ref}>{children}</StyledSortableRoot>
    </RecordTableHeaderSortableHandleRefContext.Provider>
  );
};
