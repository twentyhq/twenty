import { useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';

import { BoardCardContext } from '@/pipeline-progress/states/BoardCardContext';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { pipelineProgressIdScopedState } from '../states/pipelineProgressIdScopedState';
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
  const [pipelineProgressIdFromRecoil, setPipelineProgressId] =
    useRecoilScopedState(pipelineProgressIdScopedState, BoardCardContext);

  useEffect(() => {
    if (pipelineProgressIdFromRecoil !== pipelineProgressId) {
      setPipelineProgressId(pipelineProgressId);
    }
  }, [pipelineProgressId, setPipelineProgressId, pipelineProgressIdFromRecoil]);

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
        >
          {boardOptions.cardComponent}
        </div>
      )}
    </Draggable>
  );
}
