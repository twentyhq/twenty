import { Draggable } from '@hello-pangea/dnd';

import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { useIsRecordReadOnly } from '@/object-record/record-field/hooks/useIsRecordReadOnly';

export const RecordBoardCardDraggableContainer = ({
  recordId,
  index,
}: {
  recordId: string;
  index: number;
}) => {
  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
  });

  return (
    <RecordBoardCardContext.Provider
      value={{ recordId, isRecordReadOnly: false }}
    >
      <Draggable key={recordId} draggableId={recordId} index={index}>
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
