import { useState } from 'react';
import styled from '@emotion/styled';
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from '@hello-pangea/dnd';
import { v4 } from 'uuid';

import { RecordTablePendingRow } from '@/object-record/record-table/components/RecordTablePendingRow';

type DraggableTableBodyProps = {
  draggableItems: React.ReactNode;
  onDragEnd: OnDragEndResponder;
};

const StyledTbody = styled.tbody`
  overflow: hidden;
`;

export const DraggableTableBody = ({
  draggableItems,
  onDragEnd,
}: DraggableTableBodyProps) => {
  const [v4Persistable] = useState(v4());

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={v4Persistable}>
        {(provided) => (
          <StyledTbody
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            <RecordTablePendingRow />
            {draggableItems}
            {provided.placeholder}
          </StyledTbody>
        )}
      </Droppable>
    </DragDropContext>
  );
};
