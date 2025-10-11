import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { RecordTableBodyDroppableContextProvider } from '@/object-record/record-table/record-table-body/contexts/RecordTableBodyDroppableContext';
import { Droppable } from '@hello-pangea/dnd';
import { type ReactNode } from 'react';

type RecordTableBodyRecordGroupDroppableProps = {
  children: ReactNode;
  recordGroupId: string;
  isDropDisabled?: boolean;
};

export const RecordTableBodyRecordGroupDroppable = ({
  children,
  recordGroupId,
  isDropDisabled,
}: RecordTableBodyRecordGroupDroppableProps) => {
  return (
    <Droppable
      droppableId={recordGroupId}
      isDropDisabled={isDropDisabled}
      mode={'standard'}
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
