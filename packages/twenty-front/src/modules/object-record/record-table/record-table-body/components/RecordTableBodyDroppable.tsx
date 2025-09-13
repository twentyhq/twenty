import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { RecordTableBodyDroppableContextProvider } from '@/object-record/record-table/record-table-body/contexts/RecordTableBodyDroppableContext';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { isSomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/isSomeCellInEditModeComponentSelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
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

  const setRecordTableHoverPosition = useSetRecoilComponentState(
    recordTableHoverPositionComponentState,
  );

  const isSomeCellInEditMode = useRecoilComponentValue(
    isSomeCellInEditModeComponentSelector,
  );

  const handleMouseLeave = () => {
    if (!isSomeCellInEditMode) {
      setRecordTableHoverPosition(null);
    }
  };

  return (
    <Droppable
      droppableId={recordGroupId ?? v4Persistable}
      isDropDisabled={isDropDisabled}
    >
      {(provided) => (
        <>
          <RecordTableBody
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
            onMouseLeave={handleMouseLeave}
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
