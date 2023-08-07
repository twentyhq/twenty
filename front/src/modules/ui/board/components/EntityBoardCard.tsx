import { Draggable } from '@hello-pangea/dnd';

import { BoardOptions } from '../types/BoardOptions';

export function EntityBoardCard({
  boardOptions,
  pipelineProgressId,
  index,
}: {
  boardOptions: BoardOptions;
  pipelineProgressId: string;
  index: number;
}) {
  return (
    <Draggable
      key={pipelineProgressId}
      draggableId={pipelineProgressId}
      index={index}
    >
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
