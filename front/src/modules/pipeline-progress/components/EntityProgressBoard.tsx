import { useCallback, useEffect, useMemo, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DroppableProvided,
  OnDragEndResponder,
} from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useRecoilState } from 'recoil';

import { BoardCardContext } from '@/pipeline-progress/states/BoardCardContext';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { BoardColumn } from '@/ui/board/components/BoardColumn';
import {
  Pipeline,
  PipelineProgress,
  PipelineStage,
  useUpdateOnePipelineProgressMutation,
  useUpdateOnePipelineProgressStageMutation,
} from '~/generated/graphql';
import { boardState } from '~/pages/opportunities/boardState';

import {
  BoardPipelineStageColumn,
  getOptimisticlyUpdatedBoard,
  StyledBoard,
} from '../../ui/board/components/Board';
import { GET_PIPELINES } from '../queries';
import { BoardColumnContext } from '../states/BoardColumnContext';
import { boardColumnsState } from '../states/boardColumnsState';
import { isBoardCardSelectedFamilyState } from '../states/isBoardCardSelectedFamilyState';
import { BoardOptions } from '../types/BoardOptions';

import { EntityBoardCard } from './EntityBoardCard';
import { EntityBoardColumn } from './EntityBoardColumn';

export type EntityProgress = {
  entity: any;
  pipelineProgress: Pick<PipelineProgress, 'id' | 'amount' | 'closeDate'>;
};

export type EntityProgressDict = {
  [key: string]: EntityProgress;
};

export function EntityProgressBoard({
  boardOptions,
}: {
  boardOptions: BoardOptions;
}) {
  const [board, setBoard] = useRecoilState(boardState);

  console.log('board', board);

  const [updatePipelineProgressStage] =
    useUpdateOnePipelineProgressStageMutation();

  const updatePipelineProgressStageInDB = useCallback(
    async (
      pipelineProgressId: NonNullable<PipelineProgress['id']>,
      pipelineStageId: NonNullable<PipelineStage['id']>,
    ) => {
      updatePipelineProgressStage({
        variables: {
          id: pipelineProgressId,
          pipelineStageId,
        },
      });
    },
    [updatePipelineProgressStage],
  );

  const onDragEnd: OnDragEndResponder = useCallback(
    async (result) => {
      if (!board) return;
      const newBoard = getOptimisticlyUpdatedBoard(board, result);
      if (!newBoard) return;
      setBoard(newBoard);
      try {
        const draggedEntityId = result.draggableId;
        const destinationColumnId = result.destination?.droppableId;
        draggedEntityId &&
          destinationColumnId &&
          updatePipelineProgressStageInDB &&
          (await updatePipelineProgressStageInDB(
            draggedEntityId,
            destinationColumnId,
          ));
      } catch (e) {
        console.error(e);
      }
    },
    [board, updatePipelineProgressStageInDB, setBoard],
  );

  return (board?.length ?? 0) > 0 ? (
    <StyledBoard>
      <DragDropContext onDragEnd={onDragEnd}>
        {board?.map((column) => (
          <RecoilScope
            SpecificContext={BoardColumnContext}
            key={column.pipelineStageId}
          >
            <EntityBoardColumn boardOptions={boardOptions} column={column} />
          </RecoilScope>
        ))}
      </DragDropContext>
    </StyledBoard>
  ) : (
    <></>
  );
}
