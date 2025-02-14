import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { Droppable } from '@hello-pangea/dnd';
import { ReactNode, useState } from 'react';
import { v4 } from 'uuid';

type RecordTableBodyDroppableProps = {
  children: ReactNode;
  recordGroupId?: string;
  isDropDisabled?: boolean;
};

export const RecordTableBodyDroppable = ({
  children,
  recordGroupId,
  isDropDisabled,
}: RecordTableBodyDroppableProps) => {
  const [v4Persistable] = useState(v4());
  const recordTableBodyId = `record-table-body${recordGroupId ? '-' + recordGroupId : ''}`;

  return (
    <Droppable
      droppableId={recordGroupId ?? v4Persistable}
      isDropDisabled={isDropDisabled}
    >
      {(provided) => (
        <RecordTableBody
          id={recordTableBodyId}
          ref={provided.innerRef}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...provided.droppableProps}
        >
          {children}
          {provided.placeholder}
        </RecordTableBody>
      )}
    </Droppable>
  );
};
