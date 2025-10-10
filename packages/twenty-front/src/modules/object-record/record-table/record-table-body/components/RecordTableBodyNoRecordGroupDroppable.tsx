import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { RecordTableBodyVirtualizedDraggableClone } from '@/object-record/record-table/record-table-body/components/RecordTableBodyVirtualizedDraggableClone';
import { RecordTableBodyDroppableContextProvider } from '@/object-record/record-table/record-table-body/contexts/RecordTableBodyDroppableContext';
import { Droppable } from '@hello-pangea/dnd';
import { type ReactNode, useState } from 'react';
import { v4 } from 'uuid';

type RecordTableBodyNoRecordGroupDroppableProps = {
  children: ReactNode;
  isDropDisabled?: boolean;
};

export const RecordTableBodyNoRecordGroupDroppable = ({
  children,
  isDropDisabled,
}: RecordTableBodyNoRecordGroupDroppableProps) => {
  const [v4Persistable] = useState(v4());

  return (
    <Droppable
      droppableId={v4Persistable}
      isDropDisabled={isDropDisabled}
      mode={'virtual'}
      renderClone={(draggableProvided, draggableSnapshot, rubric) => (
        <RecordTableBodyVirtualizedDraggableClone
          draggableProvided={draggableProvided}
          draggableSnapshot={draggableSnapshot}
          rubric={rubric}
        />
      )}
    >
      {(provided) => (
        <RecordTableBody
          ref={provided.innerRef}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...provided.droppableProps}
        >
          <RecordTableBodyDroppableContextProvider
            value={{ droppablePlaceholder: provided.placeholder }}
          >
            {children}
          </RecordTableBodyDroppableContextProvider>
        </RecordTableBody>
      )}
    </Droppable>
  );
};
