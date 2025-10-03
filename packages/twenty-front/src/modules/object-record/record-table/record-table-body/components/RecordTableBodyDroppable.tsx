import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { RecordTableBodyVirtualizedDraggableClone } from '@/object-record/record-table/record-table-body/components/RecordTableBodyVirtualizedDraggableClone';
import { RecordTableBodyDroppableContextProvider } from '@/object-record/record-table/record-table-body/contexts/RecordTableBodyDroppableContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { Droppable } from '@hello-pangea/dnd';
import { type ReactNode, useState } from 'react';
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

  const hasRecordGroups = useRecoilComponentValue(
    hasRecordGroupsComponentSelector,
  );

  return (
    <Droppable
      droppableId={recordGroupId ?? v4Persistable}
      isDropDisabled={isDropDisabled}
      mode={hasRecordGroups ? 'standard' : 'virtual'}
      renderClone={
        hasRecordGroups
          ? null
          : (draggableProvided, draggableSnapshot, rubric) => (
              <RecordTableBodyVirtualizedDraggableClone
                draggableProvided={draggableProvided}
                draggableSnapshot={draggableSnapshot}
                rubric={rubric}
              />
            )
      }
    >
      {(provided) => (
        <>
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
        </>
      )}
    </Droppable>
  );
};
