import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';
import { useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { RecordTableHeaderSortableHandleRefContext } from '@/object-record/record-table/record-table-header/dnd/context/RecordTableHeaderSortableHandleRefContext';

const SORTABLE_COLLISION_PRIORITY = 3;

const PLUGINS_WITHOUT_OPTIMISTIC = [SortableKeyboardPlugin];

const StyledSortableRoot = styled.div`
  min-height: 0;
  position: relative;
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
    transition: null,
    plugins: PLUGINS_WITHOUT_OPTIMISTIC,
    feedback: 'clone',
  });

  return (
    <RecordTableHeaderSortableHandleRefContext.Provider value={handleRef}>
      <StyledSortableRoot ref={ref}>{children}</StyledSortableRoot>
    </RecordTableHeaderSortableHandleRefContext.Provider>
  );
};
