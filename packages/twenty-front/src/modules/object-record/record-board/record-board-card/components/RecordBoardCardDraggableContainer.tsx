import { Draggable } from '@hello-pangea/dnd';

import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useIsRecordReadOnly } from '@/object-record/record-field/hooks/useIsRecordReadOnly';
import { useContext } from 'react';

export const RecordBoardCardDraggableContainer = ({
  recordId,
  rowIndex,
}: {
  recordId: string;
  rowIndex: number;
}) => {
  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
  });

  const { columnIndex } = useContext(RecordBoardColumnContext);

  return (
    <RecordBoardCardContext.Provider
      value={{ recordId, isRecordReadOnly, rowIndex, columnIndex }}
    >
      <Draggable key={recordId} draggableId={recordId} index={rowIndex}>
        {(draggableProvided) => (
          <div
            ref={draggableProvided?.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided?.dragHandleProps}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided?.draggableProps}
            className="record-board-card"
            data-selectable-id={recordId}
            data-select-disable
          >
            <RecordBoardCard />
          </div>
        )}
      </Draggable>
    </RecordBoardCardContext.Provider>
  );
};
