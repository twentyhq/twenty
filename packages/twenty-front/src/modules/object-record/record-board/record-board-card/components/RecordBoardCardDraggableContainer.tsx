import { Draggable } from '@hello-pangea/dnd';

import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';

export const RecordBoardCardDraggableContainer = ({
  recordId,
  index,
}: {
  recordId: string;
  index: number;
}) => {
  return (
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
  );
};
