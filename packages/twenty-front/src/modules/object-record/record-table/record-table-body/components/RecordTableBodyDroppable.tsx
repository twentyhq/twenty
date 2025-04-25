import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
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

  const setRecordTableHoverPosition = useSetRecoilComponentStateV2(
    recordTableHoverPositionComponentState,
  );

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
          onMouseLeave={() => setRecordTableHoverPosition(null)}
        >
          {children}
          {provided.placeholder}
        </RecordTableBody>
      )}
    </Droppable>
  );
};
