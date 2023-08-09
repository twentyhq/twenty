import { Draggable } from '@hello-pangea/dnd';

import { BoardOptions } from '../types/BoardOptions';

export function EntityBoardCard({
  boardOptions,
  cardId,
  index,
}: {
  boardOptions: BoardOptions;
  cardId: string;
  index: number;
}) {
  return (
    <Draggable key={cardId} draggableId={cardId} index={index}>
      {(draggableProvided) => (
        <div
          ref={draggableProvided?.innerRef}
          {...draggableProvided?.dragHandleProps}
          {...draggableProvided?.draggableProps}
          data-selectable-id={pipelineProgressId}
          data-select-disable
        >
          {boardOptions.cardComponent}
        </div>
      )}
    </Draggable>
  );
}
